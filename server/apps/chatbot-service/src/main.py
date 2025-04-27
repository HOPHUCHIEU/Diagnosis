import asyncio
import json
import sys
import os
from config.settings import KAFKA_BROKERS, KAFKA_TOPIC_INBOUND, KAFKA_TOPIC_OUTBOUND
from gemini_handler.client import GeminiClient
from handlers.health_inquiries import HealthInquiryHandler
from handlers.doctor_list import DoctorListHandler
from handlers.appointment import AppointmentHandler
from kafka import KafkaConsumer, KafkaProducer

class ChatbotService:
    def __init__(self):
        self.consumer = KafkaConsumer(
            KAFKA_TOPIC_INBOUND,
            bootstrap_servers=[KAFKA_BROKERS],
            group_id='chatbot-consumer',
            auto_offset_reset='earliest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

        print(KAFKA_BROKERS)
        print(self.consumer)
        print("Kafka Consumer initialized")
        
        self.producer = KafkaProducer(
            bootstrap_servers=[KAFKA_BROKERS],
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )
        self.gemini_client = GeminiClient()
        self.health_handler = HealthInquiryHandler()
        self.doctor_handler = DoctorListHandler()
        self.appointment_handler = AppointmentHandler()
    
    async def process_message(self, message_data):
        try:
            user_id = message_data.get("userId")
            message_id = message_data.get("messageId")
            content = message_data.get("content")
            user_token = message_data.get("token")
            
            print(f"Processing message: {content}")
            
            if not content:
                return {
                    "userId": user_id,
                    "messageId": message_id,
                    "replyTo": message_id,
                    "content": "Tin nhắn trống",
                    "type": "error"
                }
            
            if content.lower() == "/restart":
                if hasattr(self.gemini_client, 'restart_chat'):
                    self.gemini_client.restart_chat(user_id)
                else:
                    if user_id in self.gemini_client.chat_sessions:
                        del self.gemini_client.chat_sessions[user_id]

                    if hasattr(self.gemini_client, 'redis') and self.gemini_client.redis:
                        try:
                            session_key = f"chat_history:{user_id}"
                            self.gemini_client.redis.delete(session_key)
                        except Exception as e:
                            print(f"Error clearing Redis history: {str(e)}")

                    try:
                        safe_id = "".join(c if c.isalnum() else "_" for c in user_id)
                        file_path = os.path.join(self.gemini_client.fallback_storage_dir, f"{safe_id}.pickle")
                        if os.path.exists(file_path):
                            os.remove(file_path)
                    except Exception as e:
                        print(f"Error clearing file history: {str(e)}")
                
                return {
                    "userId": user_id,
                    "messageId": f"reply-{message_id}",
                    "replyTo": message_id,
                    "content": "Cuộc hội thoại đã được khởi động lại. Bạn cần hỗ trợ gì ạ?",
                    "type": "text"
                }
            
            gemini_response = await self.gemini_client.generate_response(content, user_id=user_id)
            print(f"Gemini response-main: {gemini_response}")
            
            # If it's a regular text response
            if gemini_response["type"] == "text":
                return {
                    "userId": user_id,
                    "messageId": f"reply-{message_id}",
                    "replyTo": message_id,
                    "content": gemini_response["content"],
                    "type": "text"
                }
            
            # If it's a function call
            elif gemini_response["type"] == "function_call":
                function_name = gemini_response["function_name"]
                arguments = gemini_response["arguments"]
                
                if function_name == "get_health_info":
                    result = await self.health_handler.handle_health_query(arguments.get("query"))
                
                elif function_name == "get_doctor_list":
                    result = await self.doctor_handler.get_doctors(
                        specialty=arguments.get("specialty")
                    )
                
                elif function_name == "get_doctor_availability":
                    result = await self.appointment_handler.get_doctor_availability(
                        doctor_id=arguments.get("doctor_id"),
                        date=arguments.get("date")
                    )
                
                elif function_name == "create_appointment":
                    result = await self.appointment_handler.create_appointment(
                        doctor_id=arguments.get("doctor_id"),
                        date=arguments.get("date"),
                        time=arguments.get("time"),
                        user_token=user_token,
                        symptoms=arguments.get("symptoms"),
                        reason=arguments.get("reason")
                    )
                
                else:
                    result = {"error": f"Unknown function: {function_name}"}
                    
                print(f"Function result: {result}")
                    
                formatted_content = await self.gemini_client.format_function_result(
                    function_name, result, user_id
                )
                
                result_data = {
                    "userId": user_id,
                    "messageId": f"reply-{message_id}",
                    "replyTo": message_id,
                    "content": formatted_content,
                    "type": "text",
                    "functionName": function_name,
                    "rawResult": result
                }
                
                return result_data
            
            else:
                return {
                    "userId": user_id,
                    "messageId": f"reply-{message_id}",
                    "replyTo": message_id,
                    "content": "Không thể xử lý yêu cầu",
                    "type": "error"
                }
                
        except Exception as e:
            return {
                "userId": message_data.get("userId"),
                "messageId": f"reply-{message_data.get('messageId')}",
                "replyTo": message_data.get("messageId"),
                "content": f"Đã xảy ra lỗi: {str(e)}",
                "type": "error"
            }
    
    def handle_message(self, message_data):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        response = loop.run_until_complete(self.process_message(message_data))
        self.producer.send(KAFKA_TOPIC_OUTBOUND, value=response)

    async def process_and_respond(self, message_data):
        """
        Process message and send response via Kafka
        """
        response = await self.process_message(message_data)
        print(f"Sending response: {response}")
        if response:  # Check that response is not None
            self.producer.send(KAFKA_TOPIC_OUTBOUND, value=response)
        else:
            print("Warning: Empty response, not sending to Kafka")

    def cleanup(self):
        print("Cleaning up resources before shutdown...")
        if hasattr(self, 'gemini_client'):
            if hasattr(self.gemini_client, 'redis') and self.gemini_client.redis:
                try:
                    print("Closing Redis connection...")
                    self.gemini_client.redis.close()
                except Exception as e:
                    print(f"Error closing Redis connection: {str(e)}")
        if hasattr(self, 'consumer') and self.consumer:
            self.consumer.close()
        if hasattr(self, 'producer') and self.producer:
            self.producer.flush()
            self.producer.close()
    
    def start(self):
        print('🤖 Chatbot Microservice is running')
        try:
            for message in self.consumer:
                try:
                    data = message.value
                    print('Received message:', data)
                    self.handle_message(data)
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    print(f"Error processing message: {e}")
                    if isinstance(message.value, dict) and 'userId' in message.value:
                        error_response = {
                            'userId': message.value['userId'],
                            'message': "Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn."
                        }
                        self.producer.send(KAFKA_TOPIC_OUTBOUND, value=error_response)
        except KeyboardInterrupt:
            print("Shutting down chatbot service...")
        finally:
            self.cleanup()

if __name__ == "__main__":
    import signal
    service = ChatbotService()
    def signal_handler(sig, frame):
        print('Received shutdown signal, cleaning up...')
        service.cleanup()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    service.start()
