from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMClient(ABC):
    @abstractmethod
    async def translate(self, user_query: str) -> Dict[str, Any]:
        """
        Translate a natural language user query into a MongoDB query dict.
        """
        pass 