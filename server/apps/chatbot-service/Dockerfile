FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY apps/chatbot-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY apps/chatbot-service/src/ /app/

RUN touch /app/__init__.py /app/config/__init__.py \
    && touch /app/gemini_handler/__init__.py /app/handlers/__init__.py

# Set environment variables (customize as needed)
ENV PYTHONUNBUFFERED=1

# Create directory for chat history storage
RUN mkdir -p /app/chat_history

# Set up non-root user for security
RUN adduser --disabled-password --gecos "" appuser
RUN chown -R appuser:appuser /app
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import socket; socket.socket().connect((os.environ.get('KAFKA_BROKERS', 'kafka').split(':')[0], int(os.environ.get('KAFKA_PORT', '9092'))))" || exit 1

CMD ["python", "main.py"]
