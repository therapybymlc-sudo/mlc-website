"""
Production file storage (optional).

Backends:
  - local       → Django MEDIA_ROOT (default; ephemeral on Render)
  - cloudinary  → Cloudinary free tier (~25 GB, easy setup)
  - r2 / s3     → S3-compatible (Cloudflare R2: 10 GB free, no egress fees)
"""
from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def configure_file_storage(*, base_dir, installed_apps: list[str]) -> dict:
    """
    Mutates installed_apps when a cloud backend is enabled.
    Returns STORAGES, MEDIA_URL, MEDIA_ROOT overrides.
    """
    backend = _env("FILE_STORAGE_BACKEND", "local").lower()
    media_root = os.path.join(base_dir, "media")
    media_url = "/media/"
    storages = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    extras: dict = {}

    if backend == "cloudinary":
        cloud_name = _env("CLOUDINARY_CLOUD_NAME")
        api_key = _env("CLOUDINARY_API_KEY")
        api_secret = _env("CLOUDINARY_API_SECRET")
        if not (cloud_name and api_key and api_secret):
            logger.warning(
                "FILE_STORAGE_BACKEND=cloudinary but Cloudinary credentials are missing; using local media storage."
            )
            backend = "local"

    if backend == "cloudinary":
        for app in ("cloudinary_storage", "cloudinary"):
            if app not in installed_apps:
                installed_apps.insert(installed_apps.index("django.contrib.staticfiles"), app)

        storages["default"] = {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        }
        extras["CLOUDINARY_STORAGE"] = {
            "CLOUD_NAME": cloud_name,
            "API_KEY": api_key,
            "API_SECRET": api_secret,
        }
        media_url = f"https://res.cloudinary.com/{cloud_name}/"

    elif backend in {"r2", "s3"}:
        access_key = _env("AWS_ACCESS_KEY_ID")
        secret_key = _env("AWS_SECRET_ACCESS_KEY")
        bucket = _env("AWS_STORAGE_BUCKET_NAME")
        if not (access_key and secret_key and bucket):
            logger.warning(
                "FILE_STORAGE_BACKEND=%s but S3/R2 credentials are missing; using local media storage.",
                backend,
            )
            backend = "local"

    if backend in {"r2", "s3"}:
        access_key = _env("AWS_ACCESS_KEY_ID")
        secret_key = _env("AWS_SECRET_ACCESS_KEY")
        bucket = _env("AWS_STORAGE_BUCKET_NAME")

        if "storages" not in installed_apps:
            installed_apps.insert(installed_apps.index("django.contrib.staticfiles"), "storages")

        storages["default"] = {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        }
        custom_domain = _env("AWS_S3_CUSTOM_DOMAIN")
        endpoint = _env("AWS_S3_ENDPOINT_URL")

        extras.update(
            {
                "AWS_ACCESS_KEY_ID": access_key,
                "AWS_SECRET_ACCESS_KEY": secret_key,
                "AWS_STORAGE_BUCKET_NAME": bucket,
                "AWS_S3_REGION_NAME": _env("AWS_S3_REGION_NAME", "auto"),
                "AWS_S3_ENDPOINT_URL": endpoint or None,
                "AWS_S3_CUSTOM_DOMAIN": custom_domain or None,
                "AWS_DEFAULT_ACL": None,
                "AWS_QUERYSTRING_AUTH": False,
                "AWS_S3_FILE_OVERWRITE": False,
                "AWS_S3_OBJECT_PARAMETERS": {"CacheControl": "max-age=86400"},
                "AWS_S3_ADDRESSING_STYLE": "virtual",
                "AWS_S3_SIGNATURE_VERSION": "s3v4",
            }
        )
        if custom_domain:
            media_url = f"https://{custom_domain.rstrip('/')}/"
        elif endpoint and bucket:
            media_url = f"{endpoint.rstrip('/')}/{bucket}/"

    return {
        "STORAGES": storages,
        "MEDIA_URL": media_url,
        "MEDIA_ROOT": media_root,
        **extras,
    }
