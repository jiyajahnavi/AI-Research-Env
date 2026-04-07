# ─────────────────────────────────────────────
# STAGE 1: Frontend Build (Node.js)
# ─────────────────────────────────────────────
FROM node:18-slim AS frontend-builder

WORKDIR /build

# Copy frontend dependency manifests
COPY dashboard/package*.json ./dashboard/

# Install dependencies (only for dashboard)
WORKDIR /build/dashboard
RUN npm install

# Copy frontend source code
COPY dashboard/ ./

# Build the production bundle
RUN npm run build

# ─────────────────────────────────────────────
# STAGE 2: Backend & Final Image (Python)
# ─────────────────────────────────────────────
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=7860

WORKDIR /app

# System dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code and generic project files
COPY . .

# Copy ONLY the built frontend assets from the builder stage
# This ensures dashboard/dist is always fresh and correctly placed
COPY --from=frontend-builder /build/dashboard/dist ./dashboard/dist

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

EXPOSE 7860

# Run server
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1", "--timeout-keep-alive", "30"]