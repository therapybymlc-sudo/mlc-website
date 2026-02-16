# ============================
# Backend Dockerfile
# ============================

# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency list first (to leverage Docker caching)
COPY requirements.txt .

# Install dependencies (including secure JWT and Keycloak libs)
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install "python-jose[cryptography]" python-keycloak

# Copy all backend source files into the container
COPY . .

# Expose port 8000 for Django
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

