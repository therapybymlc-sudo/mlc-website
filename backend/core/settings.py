from pathlib import Path
import os
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

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==========================
# Clerk Configuration
# ==========================
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")

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
