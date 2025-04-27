# Chatbot Service

Chatbot service sử dụng Google Gemini API để tương tác với người dùng và hỗ trợ đặt lịch khám bệnh.

## Tính năng

- Trò chuyện cơ bản với người dùng sử dụng Google Gemini API
- Hỗ trợ đặt lịch khám:
  - Phân tích triệu chứng và gợi ý chuyên khoa
  - Hiển thị danh sách bác sĩ theo chuyên khoa
  - Hiển thị lịch khám của bác sĩ
  - Đặt lịch khám theo thời gian người dùng chọn

## Cài đặt

1: Cài đặt các gói phụ thuộc:

```bash
pip install -r requirements.txt
```

2: Cấu hình Redis (Tùy chọn):

Chatbot sử dụng Redis để lưu trữ phiên hội thoại. Bạn có thể:

- Sử dụng Redis cục bộ:

```bash
docker run --name redis -p 6379:6379 -d redis
```

- Sử dụng dịch vụ Redis Cloud

3: Cấu hình file `.env`:

```bash
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_INBOUND=chat-messages
KAFKA_TOPIC_OUTBOUND=chat-responses
API_SERVICE_URL=http://localhost:5001/api/v1
API_KEY=your_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
REDIS_HOST=redis-xxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_CHAT_TTL=86400
```

3: Chạy service:

```bash
python src/server.py
```

4: Chạy service môi trường develop:

```bash
nodemon --exec python .\src\server.py
```

## Kiến trúc

- **main.py**: Main entry point, xử lý kết nối Kafka và điều phối các tin nhắn
- **gemini_handler/client.py**: Kết nối với Gemini API
- **handlers/**: Xử lý các tình huống hội thoại khác nhau

## Luồng hội thoại

1. Người dùng gửi tin nhắn qua Kafka
2. Chatbot phân tích tin nhắn và xác định ý định của người dùng
3. Nếu là hỏi đáp thông thường, sử dụng Gemini API để trả lời
4. Nếu liên quan đến đặt lịch, dẫn dắt người dùng qua các bước đặt lịch
5. Gửi kết quả trả lời lại qua Kafka

## Quản lý phiên hội thoại

- Redis: Lưu trữ phiên hội thoại giữa các lần khởi động
- Fallback: Tự động chuyển sang lưu file khi Redis không khả dụng
- Restart: Hỗ trợ lệnh /restart để khởi động lại cuộc hội thoại

## API Endpoints

## Troubleshooting

1: Redis không kết nối được

- Kiểm tra thông tin kết nối (host, port, password)
- Xác nhận SSL setting (ssl=True cho Redis Cloud, ssl=False cho local)
- Chatbot vẫn hoạt động với file storage khi Redis không khả dụng

2: Gemini API không hoạt động

- Kiểm tra API key và model name
- Kiểm tra kết nối internet
- Xem logs để biết chi tiết lỗi

3: Phát triển

- Thêm chức năng: Tạo tool mới trong **self.tools** và handler tương ứng
- Thay đổi hành vi chatbot: Chỉnh sửa **system_prompt** trong **client.py**
- Thêm chuyên khoa y tế: Cập nhật **system_prompt** với thông tin mới
