import google.generativeai as genai
import redis
import pickle
import os
from config.settings import (
    GEMINI_API_KEY, GEMINI_MODEL, 
    REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASSWORD, REDIS_CHAT_TTL
)
import json

class GeminiClient:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )
        self.redis = None
        self.redis_available = False
        try:
            self.redis = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                password=REDIS_PASSWORD,
                ssl=False,
                decode_responses=False,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis.ping()
            self.redis_available = True
            print("✅ Redis connection successful - chat history will be persistent")
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as e:
            print(f"⚠️ Redis connection failed: {str(e)}")
            print("⚠️ Running in memory-only mode, chat history will not persist between restarts")

        self.chat_sessions = {}
        self.system_prompt = """You are a helpful clinic assistant chatbot.
You help users with basic medical inquiries and guide them to schedule appointments.
Keep responses short, friendly, and in Vietnamese.

When a user describes medical symptoms, always follow these steps in order:
1. First use the 'schedule_appointment' function to collect symptoms and identify the appropriate specialty
2. Once you have a specialty, use 'get_doctor_list' to find available doctors
3. After the user selects a doctor, use 'get_time_slots' to show available time slots
4. Finally, use 'create_appointment' to book the appointment with all details

Always try to determine a medical specialty based on the symptoms described.
For headaches, consider suggesting Neurology (Thần kinh).
For stomach issues, consider suggesting Gastroenterology (Nội tiêu hóa).
For skin problems, consider suggesting Dermatology (Da liễu).
For children, always suggest Pediatrics (Nhi khoa).
For heart-related symptoms, suggest Cardiology (Tim mạch).

ALWAYS use the appropriate function for each step in the workflow."""

        self.tools = [
            {
                "name": "get_doctor_list",
                "description": "Get a list of doctors for a specific specialty",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "specialty": {
                            "type": "STRING",
                            "description": "The medical specialty to find doctors for"
                        }
                    },
                    "required": ["specialty"]
                }
            },
            {
                "name": "get_doctor_availability",
                "description": "Get available time slots for a doctor on a specific date",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "doctor_id": {
                            "type": "STRING",
                            "description": "The ID of the selected doctor"
                        },
                        "date": {
                            "type": "STRING",
                            "description": "The date for checking availability (YYYY-MM-DD)"
                        }
                    },
                    "required": ["doctor_id", "date"]
                }
            },
            {
                "name": "create_appointment",
                "description": "Create an appointment with the selected details",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "doctor_id": {
                            "type": "STRING", 
                            "description": "The ID of the selected doctor"
                        },
                        "date": {
                            "type": "STRING",
                            "description": "The date for the appointment (YYYY-MM-DD)"
                        },
                        "time": {
                            "type": "STRING",
                            "description": "The time slot for the appointment (HH:MM)"
                        },
                        "symptoms": {
                            "type": "STRING",
                            "description": "The medical symptoms described by the user"
                        },
                        "reason": {
                            "type": "STRING",
                            "description": "The reason for the appointment"
                        }
                    },
                    "required": ["doctor_id", "date", "time"]
                }
            }
        ]

    def _get_session_key(self, user_id):
        return f"chat_history:{user_id}"
    
    def _serialize_history(self, messages):
        return pickle.dumps(messages)
    
    def _deserialize_history(self, data):
        if data:
            return pickle.loads(data)
        return None
    
    def _save_chat_history(self, user_id, messages):
        key = self._get_session_key(user_id)
        serialized = self._serialize_history(messages)
        self.redis.set(key, serialized, ex=REDIS_CHAT_TTL)
        print(f"Saved chat history for user {user_id}")
    
    def _get_chat_history(self, user_id):
        key = self._get_session_key(user_id)
        data = self.redis.get(key)
        return self._deserialize_history(data)

    async def generate_response(self, user_message, user_id=None, chat_history=None):
        try:
            if not user_id:
                print("Warning: No user_id provided, using temporary session")
                user_id = "temp_" + str(hash(user_message))

            if user_id not in self.chat_sessions:
                stored_history = self._get_chat_history(user_id)
                if stored_history:
                    chat = self.model.start_chat(history=stored_history)
                    self.chat_sessions[user_id] = chat
                    print(f"Restored chat session for user {user_id} from storage")
                else:
                    initial_messages = [
                        {"role": "user", "parts": [{"text": f"System: {self.system_prompt}"}]},
                        {"role": "model", "parts": [{"text": "Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp gì cho bạn?"}]}
                    ]

                    chat = self.model.start_chat(history=initial_messages)
                    self.chat_sessions[user_id] = chat
                    self._save_chat_history(user_id, initial_messages)
                    print(f"Created new chat session for user {user_id}")
            else:
                chat = self.chat_sessions[user_id]
                print(f"Retrieved existing chat session for user {user_id}")
            # messages = []
            
            # # Add system message first if it's a new conversation
            # if not chat_history:
            #     messages.append({"role": "system", "parts": [{"text": f"System: {self.system_prompt}"}]})
            # else:
            #     # Add chat history
            #     for message in chat_history:
            #         messages.append(message)

            # messages.append({"role": "user", "parts": [{"text": user_message}]})
            
            # print(f"Processing message: {user_message}")

            try:
                # response = await self.model.generate_content_async(
                #     contents=messages,
                #     # tools=self.tools,
                #     # tool_config={"function_calling_config": {"mode": "auto"}}
                # )
                response = await chat.send_message_async(
                    user_message,
                    tools=self.tools,
                    tool_config={"function_calling_config": {"mode": "auto"}}
                )
                print(f"Res: {response}")
                
                if hasattr(chat, 'history'):
                    self._save_chat_history(user_id, chat.history)

                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    
                    if hasattr(candidate, 'content') and candidate.content:
                        content = candidate.content
                        
                        # Kiểm tra function call trước
                        if hasattr(content, 'parts') and content.parts:
                            function_call_found = False
                            
                            for part in content.parts:
                                if hasattr(part, 'function_call') and part.function_call and hasattr(part.function_call, 'name'):
                                    function_call_found = True
                                    return {
                                        "type": "function_call",
                                        "function_name": part.function_call.name,
                                        "arguments": part.function_call.args
                                    }
                            
                            # Nếu không tìm thấy function call, mới xử lý text
                            if not function_call_found and len(content.parts) > 0:
                                if hasattr(content.parts[0], 'text') and content.parts[0].text:
                                    return {
                                        "type": "text",
                                        "content": content.parts[0].text
                                    }

                    # Fallback nếu không tìm thấy parts hoặc text
                    return {
                        "type": "text",
                        "content": response.text if hasattr(response, 'text') else "Tôi hiểu yêu cầu của bạn nhưng không thể tạo ra phản hồi phù hợp."
                    }

                return {
                    "type": "text",
                    "content": "Tôi đã nhận được tin nhắn của bạn nhưng không thể xử lý hợp lý."
                }
                
            except Exception as e:
                print(f"API call error: {str(e)}")
                return {
                    "type": "text",
                    "content": f"Xin lỗi, tôi đang gặp một số vấn đề kỹ thuật. Vui lòng thử lại sau. Lỗi: {str(e)}"
                }
                        
        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            return {
                "type": "text",
                "content": f"Đã xảy ra lỗi khi xử lý yêu cầu của bạn: {str(e)}"
            }
            
    async def format_function_result(self, function_name, function_result, user_id):
        try:
            if not user_id in self.chat_sessions:
                print(f"No active chat session found for user {user_id}")
                # Create a temporary session if needed
                user_id = "temp_" + str(hash(str(function_result)))
                initial_messages = [
                    {"role": "user", "parts": [{"text": f"System: {self.system_prompt}"}]},
                    {"role": "model", "parts": [{"text": "Xin chào! Tôi là trợ lý ảo của phòng khám. Tôi có thể giúp gì cho bạn?"}]}
                ]
                chat = self.model.start_chat(history=initial_messages)
                self.chat_sessions[user_id] = chat
                print(f"Created new temporary chat session for function result formatting")
            else:
                chat = self.chat_sessions[user_id]
                print(f"Using existing chat session for user {user_id}")
            
            # Create prompt to interpret the function result
            prompt = f"""Dưới đây là kết quả từ function {function_name}:
    {json.dumps(function_result, ensure_ascii=False)}

    Hãy diễn giải kết quả trên thành văn bản tự nhiên, thân thiện cho người dùng.
    Nếu là danh sách bác sĩ, hãy giới thiệu từng bác sĩ một cách ngắn gọn.
    Nếu là lịch trình, hãy trình bày các khung giờ có sẵn một cách rõ ràng.
    Nếu là xác nhận đặt lịch, hãy xác nhận thông tin và cảm ơn người dùng.
    Hãy trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
    QUAN TRỌNG: Chỉ trả về văn bản thuần túy, không bao gồm code blocks hay tool_code."""
    
            print(f"Prompt for function result formatting: {prompt}")

            try:
                # Send prompt to Gemini model
                response = await chat.send_message_async(prompt)
                
                # Save chat history if available
                if hasattr(chat, 'history'):
                    self._save_chat_history(user_id, chat.history)
                    
                print(f"Res: {response}")
                
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    
                    if hasattr(candidate, 'content') and candidate.content:
                        content = candidate.content
                        
                        # Kiểm tra function call trước
                        if hasattr(content, 'parts') and content.parts:
                            function_call_found = False
                            
                            for part in content.parts:
                                if hasattr(part, 'function_call') and part.function_call and hasattr(part.function_call, 'name'):
                                    function_call_found = True
                                    return {
                                        "type": "function_call",
                                        "function_name": part.function_call.name,
                                        "arguments": part.function_call.args
                                    }
                            
                            # Nếu không tìm thấy function call, mới xử lý text
                            if not function_call_found and len(content.parts) > 0:
                                if hasattr(content.parts[0], 'text') and content.parts[0].text:
                                    # Clean up the response by removing code blocks
                                    text = content.parts[0].text
                                    # Remove any ```tool_code blocks
                                    import re
                                    text = re.sub(r'```tool_code\n.*?```', '', text, flags=re.DOTALL)
                                    # Also remove any other code blocks
                                    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
                                    # Clean up any extra newlines that might be left
                                    text = re.sub(r'\n\s*\n', '\n\n', text)
                                    text = text.strip()
                                    
                                    return {
                                        "type": "text",
                                        "content": text
                                    }

                    # Fallback nếu không tìm thấy parts hoặc text
                    return {
                        "type": "text",
                        "content": response.text if hasattr(response, 'text') else "Tôi hiểu yêu cầu của bạn nhưng không thể tạo ra phản hồi phù hợp."
                    }

                return {
                    "type": "text",
                    "content": "Tôi đã nhận được tin nhắn của bạn nhưng không thể xử lý hợp lý."
                }
                
            except Exception as e:
                print(f"API call error in format_function_result: {str(e)}")
                return {
                    "type": "text",
                    "content": f"Xin lỗi, tôi đang gặp một số vấn đề kỹ thuật. Vui lòng thử lại sau. Lỗi: {str(e)}"
                }

        except Exception as e:
            print(f"Error formatting function result: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "type": "text",
                "content": f"Kết quả: {function_result.get('message', 'Không có thông tin cụ thể.')} (Lỗi định dạng: {str(e)})"
            }
