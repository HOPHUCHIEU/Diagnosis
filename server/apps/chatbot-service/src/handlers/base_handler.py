from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..models.user_session import UserSession

class BaseHandler(ABC):
    """Base class for conversation handlers"""
    
    @abstractmethod
    async def handle(self, session: UserSession, message: str) -> Optional[Dict[str, Any]]:
        """
        Handle user message based on current session state
        Returns response or None if handler can't process this message
        """
        pass
    
    @abstractmethod
    def can_handle(self, session: UserSession) -> bool:
        """Check if this handler can process the message in current session state"""
        pass
