import os
from typing import Dict, Any
import httpx
from ..base import BaseLLMClient
from ..utils.prompts import build_prompt
from ..utils.parser import extract_json

class GemmaOllamaLLMClient(BaseLLMClient):
    def __init__(self, base_url: str = "", model: str = ""):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "gemma:12b")

    async def translate(self, user_query: str) -> Dict[str, Any]:
        prompt = build_prompt(user_query)
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            llm_output = data.get("response", "")
        return extract_json(llm_output) 