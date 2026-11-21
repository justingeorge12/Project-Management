

# Use an official Python image
FROM python:3.13-slim

# Set the working directory
WORKDIR /app

# Prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Display Python output immediately
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy Django application
COPY . .

RUN chmod +x /app/entrypoint.sh

# Expose Django port
EXPOSE 8000

CMD ["/app/entrypoint.sh"]


# # Start Django using Gunicorn
# CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
