from handlers.api_client import APIClient

class DoctorListHandler:
    def __init__(self):
        self.api_client = APIClient()
    
    async def get_doctors(self, specialty=None):
        try:
            response = await self.api_client.get_doctor_profiles(
                limit=10, 
                specialty=specialty if specialty else None,
            )

            data = response.get('data', {})
            doctors = data.get('data', [])
            total = data.get('total', 0)

            formatted_doctors = []
            for doctor in doctors:
                # Extract relevant information
                doctor_id = str(doctor.get('_id', {}).get('buffer', {}).get('data', [])) if isinstance(doctor.get('_id'), dict) else doctor.get('_id')
                profile = doctor.get('doctor', {})
                name = f"Dr. {profile.get('profile', {}).get('firstName', '')} {profile.get('profile', {}).get('lastName', '')}"
                specialties = ', '.join(doctor.get('specialties', []))
                experience = f"{doctor.get('yearsOfExperience', 0)} năm"
                fee = doctor.get('consultationFee', 0)
                
                formatted_doctors.append({
                    "id": doctor_id,
                    "name": name,
                    "specialty": specialties,
                    "experience": experience,
                    "fee": fee
                })
            
            return {
                "success": True,
                "doctors": formatted_doctors,
                "total": total,
                "message": f"Tìm thấy {len(formatted_doctors)} bác sĩ phù hợp."
            }
            
        except Exception as e:
            print(f"Error getting doctors: {str(e)}")
            return {
                "success": False,
                "doctors": [],
                "total": 0,
                "error": str(e),
                "message": "Không thể lấy danh sách bác sĩ. Vui lòng thử lại sau."
            }
