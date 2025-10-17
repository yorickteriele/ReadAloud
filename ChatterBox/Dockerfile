# Use CUDA image if you want GPU, otherwise slim Python is fine
# FROM nvidia/cuda:12.2.1-cudnn8-runtime-ubuntu22.04  # GPU
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    git \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, wheel
RUN pip install --upgrade pip setuptools wheel

# Copy requirements
COPY requirements.txt .

# Install numpy first (needed by pkuseg)
RUN pip install --no-cache-dir numpy

# Install the rest of the requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Create folder for audio prompts if it doesn't exist
RUN mkdir -p /app/audio_prompts

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
