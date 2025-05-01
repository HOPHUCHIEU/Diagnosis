from handlers.api_client import APIClient

class DoctorListHandler:
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

    async def get_doctor(self, doctor_id=None):
        try:
            response = await self.api_client.get_doctor_profile(self._transform_id(doctor_id))
            data = response.get('data', {})

            doctor_obj = data.get('doctor', {})
            doctor_id = str(doctor_obj.get('_id', {}).get('buffer', {}).get('data', [])) if isinstance(doctor_obj.get('_id'), dict) else doctor_obj.get('_id')

            return {
                "success": True,
                "doctor_id": doctor_id,
                "message": "ID của bác sĩ đã được truy xuất thành công."
            }
                
        except Exception as e:
            print(f"Error getting doctor ID: {str(e)}")
            return {
                "success": False,
                "doctor_id": None,
                "error": str(e),
                "message": "Không thể lấy ID bác sĩ. Vui lòng thử lại sau."
            }
