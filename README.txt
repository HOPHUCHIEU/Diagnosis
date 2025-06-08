
Diagnosis IQ: Smart Clinical Decision Support System for Automated Hospital Administration

Tools & Technologies
- Node.js (v16 trở lên)
- MongoDB (v4.4 trở lên)
- Redis Cloud
- Kafka
- VNPAY Sandbox Account
- Google Gemini API
- Visual Studio Code
- Git

Các công nghệ sử dụng
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Cache: Redis
- Message Queue: Kafka
- AI: Google Gemini API
- Payment Gateway: VNPAY
- Internationalization: i18next

## Cài đặt

1. Cài đặt các công cụ cần thiết
# Cài đặt Node.js từ https://nodejs.org/
# Cài đặt MongoDB từ https://www.mongodb.com/try/download/community
# Cài đặt Kafka từ https://kafka.apache.org/downloads

2. Clone dự án

git clone <repository-url>
cd Diagnosis


3. Cài đặt dependencies

#### Backend
cd server
npm install

#### Frontend
cd client
npm install


4. Cấu hình môi trường
#### Backend (.env)

API_VERSION=1
RATE_VERSION=1
NODE_ENV='dev'
PORT=5001
BASE_URL=http://127.0.0.1:5001
KAFKA_BROKERS=localhost:9092

MONGODB_URI=mongodb://localhost:27017/clinic
MONGO_DB=clinic
MONGO_COLLECTION=clinic

JWT_SECRET_KEY=951f680da7dad9f12a092f068301d69d9157491d77232a46613d78b93321fcb1
MAIL_HOST=smtp.gmail.com
MAIL_USER=hophuchieu135@gmail.com
MAIL_PASSWORD=nhập khóa google 
MAIL_FROM=hophuchieu135@gmail.com
MAIL_SECURE=true
MAIL_PORT=465

TZ=Asia/Ho_Chi_Minh
vnp_TmnCode=OW2842K9
vnp_HashSecret=89P5NKTGMKXG8FZVI3G0Y0Y3CIAPXWEE
vnp_Url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnp_ReturnUrl=http://127.0.0.1:5001/api/v1/payment/vnpay-ipn
CLIENT_URL=http://localhost:5173

API_SERVICE_URL=http://127.0.0.1:5001/api/v1

GEMINI_API_KEY=nhập API key của gemini
GEMINI_MODEL=gemini-1.5-pro

KAFKA_TOPIC_INBOUND=chat-messages
KAFKA_TOPIC_OUTBOUND=chat-responses
KAFKA_GROUP_ID=chatbot-consumer

REDIS_HOST=redis-10179.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=10179
REDIS_DB=0
REDIS_PASSWORD=eqcapes21exsbqwM4bCRLF2zklBIR0qg
REDIS_CHAT_TTL=86400

#### Frontend (.env)
VITE_SERVER_URL=http://127.0.0.1:5001/api/v1
VITE_SERVER_URL_API=http://127.0.0.1:5001/api/v1
VITE_SERVER_URL_CHATBOT_API=http://127.0.0.1:5001/chatbot

VITE_GOOGLE_CLIENT_ID=640159166681-5rfudrvp01goa8hpqm1bv00a4bede7jr.apps.googleusercontent.com


VITE_ZEGOCLOUD_APP_ID=661663811
VITE_ZEGOCLOUD_SERVER_SECRET=de8e978bff99a0c96e147dd4de782f77

### 5. Khởi động các services
Start MongoDB
- net start MongoDB

*** Setup Docker ***

docker network create kafka-net

docker run -d --name zookeeper --network kafka-net -p 2181:2181 -e ALLOW_ANONYMOUS_LOGIN=yes bitnami/zookeeper

docker run -d --name kafka --restart unless-stopped -p 9092:9092 -p 9093:9093 --network kafka-net 
-e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 
-e KAFKA_CFG_PROCESS_ROLES=broker,controller 
-e KAFKA_CFG_NODE_ID=1 -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093 
-e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 
-e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 
-e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT 
-e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER 
-e ALLOW_PLAINTEXT_LISTENER=yes 
-e KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true 
-e KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1 bitnami/kafka:3.4.0

#### Start Backend

cd server
npm run dev


#### Start Frontend

cd client
npm run dev

## Đăng nhập Role
Hướng dẫn đăng nhập theo từng vai trò
1. Đăng nhập với vai trò người dùng(User)
  - URL đăng nhập: http://localhost:5173
  - Tài khoản đăng nhập:
      Email: hophuchieu135@gmail.com
      Mật khẩu: 123123
2. Đăng nhập với vai trò bác sĩ
  - URL đăng nhập: http://localhost:5173
  - Tài khoản đăng nhập:
    Email: dcotor@gmail.com 
    Mật khẩu: 123123
3. Đăng nhập với vai trò Quản trị viên(Admin)
  - URL đăng nhập: http://localhost:5173/login
  - Tài khoản đăng nhập:
    Email: admin@gmail.com
    Mật khẩu: 123123
