FROM python:3.11-slim

# ─────────────────────────────────────────────
# Environment
# ─────────────────────────────────────────────

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=7860

WORKDIR /app

# ─────────────────────────────────────────────
# System dependencies
# ─────────────────────────────────────────────

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────
# Python dependencies
# ─────────────────────────────────────────────

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────
# Copy ALL project files
# ─────────────────────────────────────────────

COPY . .

# ─────────────────────────────────────────────
# Healthcheck (FIXED)
# ─────────────────────────────────────────────

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# ─────────────────────────────────────────────
# Expose port
# ─────────────────────────────────────────────

EXPOSE 7860

# ─────────────────────────────────────────────
# Run server (HF safe config)
# ─────────────────────────────────────────────

CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1", "--timeout-keep-alive", "30"]