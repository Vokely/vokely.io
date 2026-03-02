import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
from typing import Any, Dict
#utils
from utils.prompts import LINKS_EXTRACTION_PROMPT
#models
from models.roadmap import HeadingItem, PerplexityResponseJSON
from pydantic import BaseModel

load_dotenv()  
url = "https://api.perplexity.ai/chat/completions"
API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_DEFAULT_MODEL = os.getenv("PERPLEXITY_DEFAULT_MODEL") or "sonar-pro"

async def get_perplexity_links(details: Dict[str,Any]):
    try:
        print("Generating perplexity response..")
        query = f"Follow the given instructions and generate me the links for the following topic and sub-headings:\n {details}"
        headers = {"Authorization": f"Bearer {API_KEY}"}
        payload = {
            "model": "sonar-pro",
            "messages": [
                {"role": "system", "content": LINKS_EXTRACTION_PROMPT},
                {"role": "user", "content": query},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {"schema": PerplexityResponseJSON.model_json_schema()},
            },
        }
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        raw_content = data["choices"][0]["message"]["content"]
        cleaned_json = json.loads(raw_content) 
        return cleaned_json
    except Exception as e:
        error_response = {"error": f"An unexpected error occurred: {e}"}
        return json.dumps(error_response)