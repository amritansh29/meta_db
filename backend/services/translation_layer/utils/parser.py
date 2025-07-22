# Parser for extracting MongoDB query from LLM output
import json
import re
from typing import Any, Dict

def extract_json(text: str) -> Dict[str, Any]:
    # Try to extract JSON from code block or plain text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    # Fallback: try to parse whole text
    try:
        return json.loads(text)
    except Exception:
        return {"error": "Could not parse MongoDB query from LLM output."}
