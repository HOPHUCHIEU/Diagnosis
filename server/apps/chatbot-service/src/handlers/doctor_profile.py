# from typing import Dict, List, Optional, Any
# from ..services.api_client import APIClient

# class DoctorInfoHandler:
#     def __init__(self, api_client: APIClient):
#         self.api_client = api_client
        
#     async def get_specialties(self) -> List[str]:
#         """Get available specialties"""
#         try:
#             return await self.api_client.get_specialties()
#         except Exception as e:
#             return ["Nội tiêu hóa", "Tim mạch", "Thần kinh", "Da liễu", "Nhi khoa"]
    
#     async def get_doctors_by_specialty(self, specialty: str) -> List[Dict[str, Any]]:
#         """Get doctors by specialty"""
#         try:
#             return await self.api_client.get_doctors_by_specialty(specialty)
#         except Exception as e:
#             return []
    
#     async def get_doctor_details(self, doctor_id: str) -> Optional[Dict[str, Any]]:
#         """Get detailed information about a doctor"""
#         try:
#             return await self.api_client.get_doctor_details(doctor_id)
#         except Exception as e:
#             return None
    
#     async def get_doctor_details(self, doctor_id: str) -> Optional[Dict[str, Any]]:
#         """Get detailed information about a doctor"""
#         try:
#             # Updated method name to match API client
#             return await self.api_client.get_doctor_profile_details(doctor_id)
#         except Exception as e:
#             print(f"Error getting doctor details: {str(e)}")
#             return None
    
#     def format_doctor_info(self, doctor: Dict[str, Any]) -> str:
#         """Format doctor information for display"""
#         if not doctor:
#             return "Không tìm thấy thông tin bác sĩ."
        
#         # Adjust field names to match the entity structure
#         profile = doctor.get('profile', {})
#         name = f"{profile.get('firstName', '')} {profile.get('lastName', '')}"
        
#         education = []
#         for edu in doctor.get('education', []):
#             edu_str = f"{edu.get('degree', '')} - {edu.get('university', '')} ({edu.get('graduationYear', '')})"
#             if edu.get('specialization'):
#                 edu_str += f" - {edu.get('specialization')}"
#             education.append(edu_str)
        
#         education_str = "\n".join([f"- {edu}" for edu in education]) if education else "Không có thông tin"
        
#         # Format certificates
#         certificates = []
#         for cert in doctor.get('certificates', []):
#             cert_str = f"{cert.get('name', '')} - cấp bởi {cert.get('issuedBy', '')}"
#             certificates.append(cert_str)
#         certificates_str = "\n".join([f"- {cert}" for cert in certificates]) if certificates else "Không có thông tin"
        
#         # Format achievements as experience
#         achievements = doctor.get('achievements', [])
#         experience_str = "\n".join([f"- {exp}" for exp in achievements]) if achievements else "Không có thông tin"
        
#         # Get specialties
#         specialties = ", ".join(doctor.get('specialties', []))
        
#         return f"""
#         **Thông tin bác sĩ {name}**
        
#         **Chuyên khoa:** {specialties}
#         **Kinh nghiệm:** {doctor.get('yearsOfExperience', 0)} năm
        
#         **Học vấn:**
#         {education_str}
        
#         **Kinh nghiệm làm việc:**
#         {experience_str}
        
#         **Chứng chỉ:**
#         {certificates_str}
        
#         **Giới thiệu:** {doctor.get('biography', 'Không có thông tin')}
#         """
import datetime

class AppointmentHandler:
    def __init__(self):
        # Khởi tạo kết nối DB nếu cần
        pass
    
    async def schedule_appointment(self, patient_name, doctor_id, date, time, reason=None):
        """
        Đặt lịch khám với bác sĩ
        
        Args:
            patient_name: Tên bệnh nhân
            doctor_id: ID bác sĩ
            date: Ngày đặt lịch (format: YYYY-MM-DD)
            time: Giờ đặt lịch (format: HH:MM)
            reason: Lý do khám (optional)
            
        Returns:
            Thông tin về lịch hẹn đã đặt
        """
        
        try:
            # Kiểm tra định dạng ngày giờ
            appointment_datetime = datetime.datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            
            # Kiểm tra xem lịch đã tồn tại chưa (demo)
            # Trong thực tế sẽ kiểm tra trong DB
            
            # Tạo lịch hẹn mới (demo)
            appointment_id = f"APT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Lưu vào DB (giả lập)
            # db = get_db_connection()
            # cursor = db.cursor()
            # cursor.execute(...)
            # db.commit()
            
            return {
                "success": True,
                "appointment_id": appointment_id,
                "patient_name": patient_name,
                "doctor_id": doctor_id,
                "datetime": appointment_datetime.strftime("%Y-%m-%d %H:%M"),
                "reason": reason,
                "status": "confirmed",
                "message": "Đặt lịch khám thành công!"
            }
            
        except ValueError:
            return {
                "success": False,
                "error": "Định dạng ngày giờ không hợp lệ",
                "message": "Vui lòng nhập ngày theo định dạng YYYY-MM-DD và giờ theo định dạng HH:MM"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Đã xảy ra lỗi khi đặt lịch khám"
            }
