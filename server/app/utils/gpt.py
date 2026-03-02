from typing import Dict, Any, Optional
from pydantic import ValidationError
import os, json
from openai import OpenAI
from routers.token_usage_router import attach_token_usage
from fastapi import Request
from utils.logger import logger

from utils.prompts import (
    test_prompt2,
    ROADMAP_SYSTEM_PROMPT,
    AI_TUTOR_SYSTEM_PROMPT,
    SKILL_GAP_ROADMAP_PROMPT,
    ATS_ESSENTIALS_PROMPT,
    ATS_CHECKER_SYSTEM_PROMPT,
    resume_extract_prompt,
    SKILL_GAP_ANALYSIS_SYSTEM_PROMPT
)

GPT_API_KEY = os.getenv("GPT_API_KEY")
client = OpenAI(api_key=GPT_API_KEY)
GPT_DEFAULT_MODEL = os.getenv("GPT_DEAFULT_MODEL","gpt-4.1-nano")

async def call_openai_api(
    system_prompt: str,
    user_message: str,
    model: str = GPT_DEFAULT_MODEL,
    temperature: float = 0.4,
    top_p: float = 0.9,
    response_format: Optional[Dict[str, str]] = None,
    max_tokens: Optional[int] = None,
    log_message: Optional[str] = None,
    request: Optional[Request] = None
) -> Dict[str, Any]:
    """
    Common reusable function for all OpenAI API calls.
    
    Args:
        system_prompt: The system prompt/context for the model
        user_message: The user's message/query
        model: OpenAI model to use (default: gpt-4.1-nano)
        temperature: Controls randomness (0-2, default: 0.4)
        top_p: Controls diversity via nucleus sampling (0-1, default: 0.9)
        response_format: Format specification for response (e.g., {"type": "json_object"})
        max_tokens: Maximum tokens in response
        log_message: Optional message to log before API call
    
    Returns:
        Dict containing either the parsed JSON response or error details
    """
    try:
        if log_message:
            print(log_message)
        
        # Build API call parameters
        api_params = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "top_p": top_p,
        }
        
        # Add optional parameters
        if response_format:
            api_params["response_format"] = response_format
        if max_tokens:
            api_params["max_tokens"] = max_tokens
        
        # Make API call
        response = client.chat.completions.create(**api_params)

        # Token usage logging (safe, backend only) 
        try:
            usage = getattr(response, "usage", None)  # sdk specific
            attach_token_usage(request, usage, model)
        except Exception as e:
            logger.error(f"Failed to attach token usage: {e}")

        # Get content
        content = response.choices[0].message.content

        # Parse JSON response
        try:
            json_data = json.loads(content)
            return json_data
        except json.JSONDecodeError:
            return {
                "error": "Model response is not valid JSON",
                "raw_response": content
            }
            
    except ValidationError as e:
        return {
            "error": "Validation error",
            "details": e.errors(),
            "raw_response": content if 'content' in locals() else None
        }
    except Exception as e:
        return {
            "error": "Failed to fetch from OpenAI",
            "details": str(e)
        }


async def extract_resume_details(request:Request,resume_info: Dict[str, Any]):
    """Extract and format resume details."""
    user_message = f"Here is the resume details: {resume_info}. Send me the resume details in the mentioned JSON format exactly."
    
    return await call_openai_api(
        system_prompt=resume_extract_prompt,  
        user_message=user_message,
        temperature=0.2,
        top_p=0.8,
        response_format={"type": "json_object"},
        max_tokens=7999,
        request=request
    )


async def gpt_resume_generator(request:Request,resume_details: str, job_details: str):
    """Generate optimized resume based on job details."""
    user_message = f"Here is the resume details: {resume_details}. Here is the job details: {job_details}"
    
    return await call_openai_api(
        system_prompt=test_prompt2,
        user_message=user_message,
        temperature=0.2,
        top_p=0.8,
        response_format={"type": "json_object"},
        request=request
    )


async def generate_roadmap_topics(request:Request,skill: str):
    """Generate a learning roadmap for a specific skill."""
    user_message = f"By following the system prompt, generate a roadmap for {skill}"
    
    return await call_openai_api(
        system_prompt=ROADMAP_SYSTEM_PROMPT,
        user_message=user_message,
        temperature=0.6,
        top_p=0.7,
        response_format={"type": "json_object"},
        request=request
    )


async def generate_roadmap_topics_from_skillgap(request:Request,details: Dict[str, Any]):
    """Generate roadmap based on skill gap analysis."""
    user_message = f"By following the system prompt, generate a roadmap for this JD and skills {details}"
    
    return await call_openai_api(
        system_prompt=SKILL_GAP_ROADMAP_PROMPT,
        user_message=user_message,
        temperature=0.6,
        top_p=0.7,
        response_format={"type": "json_object"},
        request=request
    )


async def generate_gpt_summaries(request:Request,details: Dict[str, Any]):
    """Generate summaries for learning topics."""
    user_message = f"Generate me the summaries for the following sub-headings in the given topic:\n {details}."
    
    return await call_openai_api(
        system_prompt=AI_TUTOR_SYSTEM_PROMPT,
        user_message=user_message,
        temperature=0.4,
        top_p=0.9,
        response_format={"type": "json_object"},
        log_message="Generating gpt summaries..",
        request=request
    )


async def get_ats_recommendations(request:Request,resume_details: Dict[str, Any]):
    """Get ATS optimization recommendations for resume."""
    user_message = f"Here is the resume details:\n {resume_details}."
    
    return await call_openai_api(
        system_prompt=ATS_ESSENTIALS_PROMPT,
        user_message=user_message,
        temperature=0.4,
        top_p=0.9,
        response_format={"type": "json_object"},
        log_message="Generating ATS recommendations..",
        request=request
    )


async def gpt_ats_checker(request:Request,resume_details: str, job_details: str):
    """Check resume compatibility with job requirements using ATS analysis."""
    user_message = f"Here is the resume details: {resume_details}. Here is the job details: {job_details}"
    
    return await call_openai_api(
        system_prompt=ATS_CHECKER_SYSTEM_PROMPT,
        user_message=user_message,
        temperature=0.2,
        top_p=0.8,
        response_format={"type": "json_object"},
        request=request
    )

async def generate_skill_gap_report(request:Request,resume_details: str, job_description: str):
    """
    Generate a skill gap analysis report using GPT in structured JSON format.
    The model compares resume skills vs job description and returns insights
    as per the SkillGapAIResponse schema.
    """
    user_message = f"Generate a skill gap analysis report strictly in JSON format. Here is the required details \njob_description: {job_description}\nresume_details: {resume_details}"

    try:
        return await call_openai_api(
            system_prompt=SKILL_GAP_ANALYSIS_SYSTEM_PROMPT,
            user_message=user_message,
            temperature=0.5,
            top_p=0.7,
            response_format={"type": "json_object"},
            max_tokens=7999,
            log_message="Invoking openai request",
            request=request
        )

    except Exception as e:
        print(f"Error while generating skill gap report: {e}")
        return {"error": "Failed to generate skill gap report"}
