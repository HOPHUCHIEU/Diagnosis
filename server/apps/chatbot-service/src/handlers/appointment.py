import datetime
from handlers.api_client import APIClient

class AppointmentHandler:
    def __init__(self):
        self.api_client = APIClient()
    
    def _int_list_to_hex(self, int_list):
            """Convert a list of integers to a continuous hex string"""
            return ''.join([format(num, '02x') for num in int_list])
    
    def _buffer_to_hex(self, input_data):
        if isinstance(input_data, str):
            # Try to parse as an integer if it's a numeric string
            if input_data.strip().isdigit():
                return format(int(input_data.strip()), '02x')
            return input_data
        elif isinstance(input_data, int):
            return format(input_data, '02x')
        elif hasattr(input_data, 'buffer') and hasattr(input_data.buffer, 'data') and isinstance(input_data.buffer.data, list):
            return ''.join([format(byte, '02x') for byte in input_data.buffer.data])
        elif hasattr(input_data, 'data') and isinstance(input_data.data, list):
            return ''.join([format(byte, '02x') for byte in input_data.data])
        elif isinstance(input_data, (bytes, bytearray)):
            return ''.join([format(byte, '02x') for byte in input_data])
        elif isinstance(input_data, memoryview):
            return ''.join([format(byte, '02x') for byte in input_data.tobytes()])
        else:
            return str(input_data)
        
    def _transform_id(self, doctor_id):
        if isinstance(doctor_id, list):
            if all(isinstance(id, int) for id in doctor_id):
                # List of integers - convert to a single continuous hex string
                return self._int_list_to_hex(doctor_id)
            else:
                # Mixed list - convert each item using buffer_to_hex and join
                return ''.join([self._buffer_to_hex(id) for id in doctor_id])
        elif isinstance(doctor_id, str) and doctor_id.startswith('[') and doctor_id.endswith(']'):
            try:
                # Try to parse as a list of integers
                doctor_ids = eval(doctor_id)
                if isinstance(doctor_ids, list) and all(isinstance(id, int) for id in doctor_ids):
                    return self._int_list_to_hex(doctor_ids)
                else:
                    # Not a list of integers - fall back to string processing
                    doctor_ids = doctor_id.strip('[]').replace(' ', '').split(',')
                    return ''.join([self._buffer_to_hex(id.strip()) for id in doctor_ids])
            except:
                # If eval fails, fall back to string processing
                doctor_ids = doctor_id.strip('[]').replace(' ', '').split(',')
                return ''.join([self._buffer_to_hex(id.strip()) for id in doctor_ids])
        else:
            # Handle buffer or single ID case
            return self._buffer_to_hex(doctor_id)
    
    async def get_doctor_availability(self, doctor_id, date):
        try:
            if date is None:
                date = datetime.datetime.now().strftime('%Y-%m-%d')
            start_date = date
            end_date = None
            
            try:
                date_obj = datetime.datetime.strptime(date, '%Y-%m-%d')
                end_date_obj = date_obj + datetime.timedelta(days=7)
                end_date = end_date_obj.strftime('%Y-%m-%d')
            except:
                pass
            response = await self.api_client.get_doctor_availability(
                doctor_id=self._transform_id(doctor_id),
                start_date=start_date,
                end_date=end_date
            )

            available_slots = []
            
            # Parse the API response format - data is in response.data array
            daily_schedules = response.get('data', [])
            
            for day_schedule in daily_schedules:
                day_date = day_schedule.get('date')
                
                if day_date == date:
                    sessions = day_schedule.get('availableSessions', {})
                    for session_type in ['morning', 'afternoon', 'evening']:
                        session_data = sessions.get(session_type, {})
                        if session_data:  # Check if session exists
                            start = session_data.get('start')
                            end = session_data.get('end')
                            
                            if not (start and end):
                                continue
                                
                            # Generate slots based on defaultConsultationDuration
                            slot_duration = day_schedule.get('defaultConsultationDuration', 30)
                            
                            start_time = datetime.datetime.strptime(start, '%H:%M')
                            end_time = datetime.datetime.strptime(end, '%H:%M')
                            
                            current = start_time
                            while current + datetime.timedelta(minutes=slot_duration) <= end_time:
                                slot_start = current.strftime('%H:%M')
                                slot_end = (current + datetime.timedelta(minutes=slot_duration)).strftime('%H:%M')
                                
                                # Check if slot is not in booked slots
                                is_available = True
                                for booked in day_schedule.get('bookedSlots', []):
                                    booked_start = booked.get('startTime')
                                    booked_end = booked.get('endTime')
                                    
                                    if (slot_start >= booked_start and slot_start < booked_end) or \
                                    (slot_end > booked_start and slot_end <= booked_end):
                                        is_available = False
                                        break
                                
                                if is_available:
                                    available_slots.append({
                                        "start": slot_start,
                                        "end": slot_end
                                    })
                                
                                current += datetime.timedelta(minutes=slot_duration)
            
            return {
                "success": True,
                "doctor_id": doctor_id,
                "date": date,
                "available_slots": available_slots,
                "message": f"Tìm thấy {len(available_slots)} khung giờ trống."
            }
            
        except Exception as e:
            print(f"Error getting availability: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Không thể lấy thông tin lịch trống của bác sĩ."
            }
    
    async def create_appointment(self, doctor_id, date, time, user_token=None, symptoms=None, reason=None):
        try:
            # Validate required fields
            if not all([doctor_id, date, time]):
                return {
                    "success": False,
                    "error": "Thiếu thông tin bắt buộc",
                    "message": "Cần có ID bác sĩ, ngày và giờ khám"
                }
            
            # Calculate end time (30 min appointment)
            hour, minute = map(int, time.split(':'))
            end_minute = minute + 30
            end_hour = hour
            if end_minute >= 60:
                end_minute -= 60
                end_hour += 1
            end_time = f"{end_hour:02d}:{end_minute:02d}"
            
            # Get doctor details to get consultation fee
            doctor_response = await self.api_client.get_doctor_profile(self._transform_id(doctor_id))
            doctor_details = doctor_response.get('data', {})
            fee = doctor_details.get('consultationFee', 0)
            
            # Create appointment data
            appointment_data = {
                "doctorId": self._transform_id(doctor_id),
                "appointmentDate": date,
                "startTime": time,
                "endTime": end_time,
                "appointmentFee": fee,
                "type": "IN_PERSON",
                "medicalInfo": {
                    "symptoms": symptoms or "",
                    "reason": reason or "Đặt lịch qua chatbot"
                }
            }
            
            # Call API to create appointment
            response = await self.api_client.create_appointment(appointment_data, user_token)
            
            if response.get('_id'):
                # Get doctor name
                doctor_name = "Bác sĩ"
                if 'doctor' in response:
                    doctor_profile = response.get('doctor', {}).get('profile', {})
                    doctor_name = f"Bác sĩ {doctor_profile.get('firstName', '')} {doctor_profile.get('lastName', '')}"
                
                return {
                    "success": True,
                    "appointment_id": response.get('_id'),
                    "doctor_id": doctor_id,
                    "doctor_name": doctor_name,
                    "date": date,
                    "time": time,
                    "end_time": end_time,
                    "symptoms": symptoms,
                    "reason": reason,
                    "fee": fee,
                    "status": "confirmed",
                    "message": "Đặt lịch khám thành công!"
                }
            else:
                return {
                    "success": False,
                    "error": response.get('message', 'Unknown error'),
                    "message": "Không thể đặt lịch khám. Vui lòng thử lại sau."
                }
                
        except Exception as e:
            print(f"Error creating appointment: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Đã xảy ra lỗi khi đặt lịch khám."
            }
