class HealthInquiryHandler:
    def __init__(self):
        # Có thể kết nối DB hoặc khởi tạo các nguồn dữ liệu khác
        pass
    
    async def handle_health_query(self, query):
        return {
            "answer": f"Đây là thông tin về câu hỏi sức khỏe của bạn: '{query}'",
            "sources": ["https://example.com/health-info"],
            "disclaimer": "Thông tin này chỉ mang tính chất tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp."
        }
