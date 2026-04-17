# Use a professional, slim Python base
FROM python:3.12-slim

# Set industrial environment defaults
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system dependencies for clinical modules (PostgreSQL, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install clinical backend dependencies
COPY vitacare/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend project source
COPY vitacare/ /app/

# Optimize static files for clinical delivery
RUN python manage.py collectstatic --no-input

# Expose the internal container port
EXPOSE 8080

# Launch with Daphne ASGI for real-time bedside signaling
CMD ["daphne", "-b", "0.0.0.0", "-p", "8080", "vitacare.asgi:application"]
