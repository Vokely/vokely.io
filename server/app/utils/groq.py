import os
from dotenv import load_dotenv
import requests
import json
from groq import Groq
from typing import Any, Dict
from fastapi import Request
from routers.token_usage_router import attach_token_usage
#utils
from utils.prompts import test_prompt2, resume_extract_prompt, AI_TUTOR_SYSTEM_PROMPT
from utils.logger import logger

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL") or "llama-3.1-8b-instant"

if not API_KEY:
    raise ValueError("GROQ_API_KEY is missing. Please check your .env file.")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY is missing. Please check your .env file.")

client = Groq(api_key=API_KEY)

async def deepseek_groq_resume(resume_details: str, job_details: str) -> str:
    """
    Call Deepseek API directly to analyze resume against job description and provide recommendations
    
    Args:
        resume_details (str): The details of the resume
        job_details (str): The details of the job
    
    Returns:
        str: JSON response with analysis and recommendations from Deepseek
    """
    try:
        content = f"Here is the resume details:{resume_details} and here is the Job details:{job_details}"
        url = "https://api.deepseek.com/chat/completions"

        payload = json.dumps({
            "messages": [
                {"content": DEEPSEEK_SYSTEM_PROMPT, "role": "system"},
                {"content": content, "role": "user"}
            ],
            "model": "deepseek-reasoner",
            "frequency_penalty": 0,
            "max_tokens": 2048,
            "presence_penalty": 0,
            "response_format": {"type": "text"},
            "stop": None,
            "stream": False,
            "temperature": 1,
            "top_p": 1
        })
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }

        response = requests.post(url, headers=headers, data=payload)
        response_json = response.json()

        if "choices" in response_json and len(response_json["choices"]) > 0:
            sys_prompt = response_json["choices"][0]["message"]["content"]
            print("Generating groq response..")
            groq_response = await groq_resume_generator(resume_details, job_details, sys_prompt)
            return groq_response
        else:
            return json.dumps({"error": "Invalid response from Deepseek API"}, indent=4)
    except Exception as error:
        return json.dumps({"error": str(error)}, indent=4)

async def groq_resume_generator(resume_details: str, job_details: str, sys_prompt: str=None):
    """
    Generate a resume using Groq API based on resume details and job details.
    
    Args:
        resume_details (str): The details of the resume
        job_details (str): The details of the job
        sys_prompt (str): System-generated prompt from Deepseek analysis
    
    Returns:
        dict: JSON response from the API or error message
    """
    try:
        content = f"Here is the resume details:{resume_details} and here is the Job details:{job_details}.Give me the output in the exact json format."
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": test_prompt2},
                {"role": "user", "content": content},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            top_p=0.9,
            max_tokens=7999,
            response_format={"type": "json_object"},
        )

        response_text = completion.choices[0].message.content.replace("\n", " ")
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return json.dumps({"error": "Response is not valid JSON"}, indent=4)
    except Exception as error:
        return json.dumps({"error": str(error)}, indent=4)

async def groq_resume_extractor(request:Request,resume_info):
    try:
        query = f"Here is the resume details: {resume_info}.Send me the resume details in the mentioned JSON format exactly."
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": resume_extract_prompt},
                {"role": "user", "content": query},
            ],
            model=GROQ_MODEL,
            temperature=0.2,
            top_p=0.8,
            max_tokens=7999,
            response_format={"type": "json_object"},
        )
        try:
            # Token usage logging (safe, backend only) 
            try:
                logger.debug(completion)
                usage = getattr(completion, "usage", None)  
                attach_token_usage(request, usage, GROQ_MODEL)
            except Exception as e:
                logger.error(f"Failed to attach token usage: {e}")
                
            json_data = completion.choices[0].message.content.replace("\n", " ")
            formatted_json = json.loads(json_data)
        except json.JSONDecodeError:
            formatted_json = {"error": "Response is not valid JSON"}
        return formatted_json
    except Exception as e:
        print(f"Error: {e}")

async def get_summaries_of_sub_headings(request:Request,query:Dict[str,Any]):
    query = f"Generate me the summaries for the following sub-headings in the given topic:\n {query}."
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content":AI_TUTOR_SYSTEM_PROMPT },
                {"role": "user", "content": query},
            ],
            model=GROQ_MODEL,
            temperature=0.4,
            max_completion_tokens=4096,
            top_p=0.95,
            stream=False,
            stop=None,
            response_format={"type": "json_object"},
        )
        try:
            # Token usage logging (safe, backend only) 
            try:
                logger.debug(completion)
                usage = getattr(completion, "usage", None)  
                attach_token_usage(request, usage, GROQ_MODEL)
            except Exception as e:
                logger.error(f"Failed to attach token usage: {e}")

            json_data = completion.choices[0].message.content.replace("\n", " ")
            formatted_json = json.loads(json_data)
        except json.JSONDecodeError:
            formatted_json = {"error": "Response is not valid JSON"}
        return formatted_json.get("summaries_data",[])
    except Exception as e:
        print(f"Error: {e}")