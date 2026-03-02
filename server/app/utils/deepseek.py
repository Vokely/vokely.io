import os
from openai import OpenAI
import requests
import json
from typing import Dict, Any
from utils.prompts import output_json, test_prompt, test_prompt2, resume_extract_prompt, dummy_response

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

async def deepseek_resume(resume_details: str,job_details: str):
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    query = f"Here is the resume details: {resume_details}.Here is the job details: {job_details}"
    try:
        # Make the API call using the OpenAI client
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": test_prompt2},
                {"role": "user", "content": query},
            ],
            temperature=1,
            max_tokens=8192,
            response_format={'type':'json_object'},
            stream=False
          )
        result = json.loads(response.choices[0].message.content)
    except Exception as e:
        raise Exception(f"Error calling DeepSeek API: {e}")

    return result

async def deepseek_prompt_test(resume_details: str,job_details: str, prompt: str):
    prompt += output_json
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    query = f"Here is the resume details: {resume_details}.Here is the job details: {job_details}"
    try:
        # Make the API call using the OpenAI client
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query},
            ],
            temperature=1,
            max_tokens=8192,
            response_format={'type':'json_object'},
            stream=False
          )
        result = json.loads(response.choices[0].message.content)
    except Exception as e:
        raise Exception(f"Error calling DeepSeek API: {e}")

    return dummy_response
    # return result

def get_resume_details(resume_info):
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    query = f"Here is the resume details: {resume_info}.Send me the resume details in the mentioned JSON format exactly."
    try:
        # Make the API call using the OpenAI client
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": resume_extract_prompt},
                {"role": "user", "content": query},
            ],
            temperature=1,
            max_tokens=8192,
            response_format={'type':'json_object'},
            stream=False
          )
        # response = call_via_API(query)
        result = json.loads(response.choices[0].message.content)
    except Exception as e:
        raise Exception(f"Error calling DeepSeek API: {e}")

    return result

# def call_via_API(query:str):
    url = "https://api.deepseek.com/chat/completions"

    payload = json.dumps({
      "messages": [
        {
          "content": test_prompt2,
          "role": "system"
        },
        {
          "content": query,
          "role": "user"
        }
      ],
      "model": "deepseek-chat",
      "frequency_penalty": 0,
      "max_tokens": 8192,
      "presence_penalty": 0,
      "response_format": {
        "type": "json_object"
      },
      "stop": None,
      "stream": False,
      "stream_options": None,
      "temperature": 1,
      "top_p": 1,
      "tools": None,
      "tool_choice": "none",
      "logprobs": False,
      "top_logprobs": None
    })
    headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': f"Bearer {DEEPSEEK_API_KEY}",
      "Cache-Control": "no-cache, no-store, must-revalidate",  
      "Pragma": "no-cache",  
      "Expires": "0",  
    }

    response = requests.post(url, headers=headers, data=payload)
    resume_data = response.json()
    print(resume_data.get("choices"))
    return resume_data.get("choices")
