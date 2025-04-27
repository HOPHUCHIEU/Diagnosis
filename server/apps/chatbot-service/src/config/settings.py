import os
from dotenv import load_dotenv

try:
    load_dotenv()
except:
    pass 

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
KAFKA_TOPIC_INBOUND = os.getenv("KAFKA_TOPIC_INBOUND", "chat-messages")
KAFKA_TOPIC_OUTBOUND = os.getenv("KAFKA_TOPIC_OUTBOUND", "chat-responses")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "chatbot-consumer")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBqn_HRxRsXHtC6zcbEyqTVoI7Nr7fD980")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/clinic")
MONGO_DB = os.getenv("MONGO_DB", "clinic")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "clinic")

REDIS_HOST = os.getenv("REDIS_HOST", "redis-diagnosis")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
REDIS_DB = os.getenv("REDIS_DB", 0)
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_CHAT_TTL = os.getenv("REDIS_CHAT_TTL", 3600)  # 1 hour

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:5000/api/v1")
API_TOKEN = os.environ.get("API_TOKEN", "")
