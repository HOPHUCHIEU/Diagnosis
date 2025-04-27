import aiohttp
import json
from config.settings import API_BASE_URL, API_TOKEN

class APIClient:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.default_token = API_TOKEN
    
    def _get_headers(self, user_token=None):
        """Generate headers with appropriate authentication token"""
        token = user_token if user_token else self.default_token
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    
    async def get(self, endpoint, params=None, user_token=None):
        hearers = self._get_headers(user_token)
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/{endpoint}", 
                headers=hearers, 
                params=params
            ) as response:
                return await response.json()
    
    async def post(self, endpoint, data, user_token=None):
        headers = self._get_headers(user_token)
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/{endpoint}", 
                headers=headers, 
                json=data
            ) as response:
                return await response.json()

    async def get_doctor_profiles(self, page=1, limit=10, search=None, specialty=None):
        params = {}
        # if search:
        #     params["search"] = search
        if specialty:
            params["specialties"] = specialty
        return await self.get("doctor-profile/all", params)
    
    async def get_specialties(self):
        return await self.get("doctor-profile/specialties")
    
    async def get_doctor_profile(self, doctor_id):
        return await self.get(f"doctor-profile/{doctor_id}")

    async def get_doctor_availability(self, doctor_id, start_date, end_date=None):
        params = {
            "startDate": start_date
        }
        if doctor_id:
            params["id"] = doctor_id
            
        if end_date:
            params["endDate"] = end_date

        return await self.get("work-schedule/doctor/availability", params)

    async def create_appointment(self, appointment_data, user_token=None):
        return await self.post("appointment/create", appointment_data, user_token)
