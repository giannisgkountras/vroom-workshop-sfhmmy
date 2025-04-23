# Use official Python image
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \        
    libglib2.0-0 \            
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend .

# Expose the port FastAPI will run on
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
