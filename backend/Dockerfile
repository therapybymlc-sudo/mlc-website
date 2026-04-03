# ============================
# Backend Dockerfile
# ============================

# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency list first (to leverage Docker caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy all backend source files into the container
COPY . .

# Expose port 8000 for Django
EXPOSE 8000

# Default command for production (Render)
CMD ["sh", "-c", "gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
