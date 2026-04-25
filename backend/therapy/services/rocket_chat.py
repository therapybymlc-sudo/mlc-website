"""
Rocket.Chat provisioning + iframe session bootstrap helpers.

This module keeps the integration optional:
- If Rocket.Chat env vars are missing, the API returns enabled=False.
- User provisioning is idempotent per therapist/client profile.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass


class RocketChatError(Exception):
    pass


@dataclass
class RocketChatConfig:
    base_url: str
    admin_user_id: str
    admin_auth_token: str
    managed_user_password: str
    timeout_seconds: int

    @property
    def enabled(self) -> bool:
        return bool(self.base_url and self.admin_user_id and self.admin_auth_token)


def get_config() -> RocketChatConfig:
    return RocketChatConfig(
        base_url=(os.getenv("ROCKET_CHAT_URL", "") or "").rstrip("/"),
        admin_user_id=(os.getenv("ROCKET_CHAT_ADMIN_USER_ID", "") or "").strip(),
        admin_auth_token=(os.getenv("ROCKET_CHAT_ADMIN_AUTH_TOKEN", "") or "").strip(),
        managed_user_password=os.getenv("ROCKET_CHAT_MANAGED_USER_PASSWORD", "mlc-rocket-chat-password"),
        timeout_seconds=int(os.getenv("ROCKET_CHAT_TIMEOUT_SECONDS", "12")),
    )


def _request_json(
    cfg: RocketChatConfig,
    method: str,
    path: str,
    payload: dict | None = None,
    auth_user_id: str | None = None,
    auth_token: str | None = None,
) -> dict:
    if not cfg.base_url:
        raise RocketChatError("Rocket.Chat URL is not configured.")
    url = f"{cfg.base_url}{path}"
    body = None
    headers = {"Content-Type": "application/json"}
    user_id = auth_user_id or cfg.admin_user_id
    token = auth_token or cfg.admin_auth_token
    if user_id and token:
        headers["X-User-Id"] = user_id
        headers["X-Auth-Token"] = token
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url=url, data=body, method=method.upper(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=cfg.timeout_seconds) as res:
            raw = res.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        raise RocketChatError(f"Rocket.Chat HTTP {exc.code}: {details[:400]}")
    except urllib.error.URLError as exc:
        raise RocketChatError(f"Rocket.Chat connection error: {exc}")


def _safe_username(raw: str) -> str:
    value = "".join(ch if ch.isalnum() or ch in {"_", "-", "."} else "_" for ch in (raw or "").strip().lower())
    return value.strip("_")[:60] or "mlc_user"


def _safe_name(value: str) -> str:
    return (value or "MLC User").strip()[:120]


def _safe_email(value: str, username: str) -> str:
    raw = (value or "").strip().lower()
    if "@" in raw:
        return raw[:254]
    return f"{username}@mlc.local"


def get_or_create_user(cfg: RocketChatConfig, *, username: str, name: str, email: str) -> dict:
    uname = _safe_username(username)
    qs = urllib.parse.urlencode({"username": uname})
    info = _request_json(cfg, "GET", f"/api/v1/users.info?{qs}")
    if info.get("success") and info.get("user"):
        user = info["user"]
        return {"user_id": user.get("_id"), "username": user.get("username") or uname}

    payload = {
        "username": uname,
        "name": _safe_name(name),
        "email": _safe_email(email, uname),
        "password": cfg.managed_user_password,
        "verified": True,
        "active": True,
        "joinDefaultChannels": True,
        "requirePasswordChange": False,
        "sendWelcomeEmail": False,
    }
    created = _request_json(cfg, "POST", "/api/v1/users.create", payload=payload)
    if not created.get("success"):
        err = created.get("error") or created.get("message") or "Could not create Rocket.Chat user."
        raise RocketChatError(str(err))
    user = created.get("user") or {}
    return {"user_id": user.get("_id"), "username": user.get("username") or uname}


def ensure_dm_room(cfg: RocketChatConfig, *, username_a: str, username_b: str) -> None:
    """
    Best effort: create/open DM room so it appears in the sidebar for both users.
    """
    payload = {"usernames": [username_a, username_b]}
    try:
        _request_json(cfg, "POST", "/api/v1/im.create", payload=payload)
    except RocketChatError:
        # Non-fatal. Users can still manually start chats in Rocket.Chat.
        return


def login_managed_user(cfg: RocketChatConfig, *, username: str) -> dict:
    payload = {"user": username, "password": cfg.managed_user_password}
    data = _request_json(cfg, "POST", "/api/v1/login", payload=payload, auth_user_id="", auth_token="")
    if not data.get("status") == "success":
        err = data.get("error") or data.get("message") or "Could not login to Rocket.Chat."
        raise RocketChatError(str(err))
    body = data.get("data") or {}
    return {
        "auth_token": body.get("authToken"),
        "user_id": body.get("userId"),
        "username": body.get("me", {}).get("username") or username,
        "name": body.get("me", {}).get("name") or username,
    }
