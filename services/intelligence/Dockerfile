# IntelliHire v3 - Python Intelligence Platform Container Image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (build-essential, g++ for sandbox)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || true

COPY . .

ENV ENVIRONMENT=production \
    PORT=8000 \
    HOST=0.0.0.0

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "app/main.py"]
