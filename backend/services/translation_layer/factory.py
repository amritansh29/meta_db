import os
from .base import BaseLLMClient
from .models.openai import OpenAILLMClient
# from .models.local import LocalLLMClient  

def get_llm_client() -> BaseLLMClient:
    backend = os.getenv("LLM_BACKEND", "openai").lower()
    if backend == "openai":
        return OpenAILLMClient()
    # elif backend == "local":
    #     return LocalLLMClient()
    else:
        raise ValueError(f"Unknown LLM_BACKEND: {backend}") 