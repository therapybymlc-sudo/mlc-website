from pathlib import Path
import os
import sys
from dotenv import load_dotenv
import dj_database_url

# ==========================
# Base Setup
# ==========================
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ==========================
# Core Django Settings
# ==========================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-placeholder")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",") if h.strip()]

# ==========================
# Installed Apps
# ==========================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "therapy",
]

# ==========================
# Middleware
# ==========================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

# ==========================
# Templates (serve React dist/)
# ==========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "react-frontend", "dist")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ==========================
# Database (PostgreSQL)
# ==========================
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "mlc_db"),
            "USER": os.getenv("DB_USER", "mlc_user"),
            "PASSWORD": os.getenv("DB_PASSWORD", "mlc_pass"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

# ==========================
# Test DB overrides (env-driven)
# ==========================
IS_TESTING = any(arg in {"test", "pytest"} for arg in sys.argv) or os.getenv("DJANGO_TESTING") == "True"
USE_SQLITE_TESTS = os.getenv("DJANGO_TEST_SQLITE") == "True"

if IS_TESTING and USE_SQLITE_TESTS:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.getenv("SQLITE_TEST_PATH", ":memory:"),
        }
    }
elif IS_TESTING:
    test_url = os.getenv("DATABASE_URL_TEST")
    if test_url:
        DATABASES = {"default": dj_database_url.parse(test_url, conn_max_age=0)}
    else:
        overrides = {
            "NAME": os.getenv("DB_NAME_TEST"),
            "USER": os.getenv("DB_USER_TEST"),
            "PASSWORD": os.getenv("DB_PASSWORD_TEST"),
            "HOST": os.getenv("DB_HOST_TEST"),
            "PORT": os.getenv("DB_PORT_TEST"),
        }
        DATABASES["default"] = {**DATABASES["default"], **{k: v for k, v in overrides.items() if v}}

    test_name = os.getenv("DB_NAME_TEST")
    if test_name:
        DATABASES["default"]["TEST"] = {"NAME": test_name}

# ==========================
# Password Validation
# ==========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ==========================
# Localization
# ==========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kuwait"
USE_I18N = True
USE_TZ = True

# ==========================
# Static Files
# ==========================
STATIC_URL = "static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "react-frontend", "dist", "assets")]
MEDIA_URL = "media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==========================
# Clerk Configuration
# ==========================
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "therapybymlc@gmail.com,therapy@mlchealth.in")
ADMIN_USER_IDS = os.getenv("ADMIN_USER_IDS", "user_3CalFf5iOUKgTEq1efJUXni3y98")

# ==========================
# Django REST Framework
# ==========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "auth.clerk_auth.ClerkAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",  # ✅ requires valid Clerk token
    ],
}
# ==========================
# CORS & CSRF
# ==========================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
if _cors_env:
    CORS_ALLOWED_ORIGINS += [o.strip() for o in _cors_env.split(",") if o.strip()]

# Allow Vercel preview domains (and other regex-based origins) via env
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
_cors_regex_env = os.getenv("CORS_ALLOWED_ORIGIN_REGEXES", "")
if _cors_regex_env:
    CORS_ALLOWED_ORIGIN_REGEXES += [
        o.strip() for o in _cors_regex_env.split(",") if o.strip()
    ]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
_csrf_env = os.getenv("CSRF_TRUSTED_ORIGINS", "")
if _csrf_env:
    CSRF_TRUSTED_ORIGINS += [o.strip() for o in _csrf_env.split(",") if o.strip()]

# ==========================
# Authentication Backends
# ==========================
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]

# ==========================
# Jitsi / JaaS Configuration
# ==========================
JITSI_APP_ID = os.getenv("JITSI_APP_ID")
JITSI_KID = os.getenv("JITSI_KID")
JITSI_PRIVATE_KEY = os.getenv("JITSI_PRIVATE_KEY")
