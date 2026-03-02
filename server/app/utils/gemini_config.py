import os
from dotenv import load_dotenv
import google.generativeai as genai
from utils.prompts import test_prompt2, output_json, resume_extract_prompt, ROADMAP_SYSTEM_PROMPT

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY") 
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing. Please check your .env file.")
genai.configure(api_key=API_KEY)

generation_config = {
    "temperature": 0.5,  
    "top_p": 0.9,        
    "top_k": 50,       
    "max_output_tokens": 8192,  # Retained for detailed, complete resumes.
    "response_mime_type": "application/json",
}

roadmap_config = {
    "temperature": 0.6,  
    "top_p": 0.6,        
    "top_k": 40,       
    "max_output_tokens": 8192,  # Retained for detailed, complete resumes.
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-preview-04-17",
    generation_config=generation_config,
    system_instruction=test_prompt2,
)

roadmap_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-preview-04-17",
    generation_config=roadmap_config,
    system_instruction=ROADMAP_SYSTEM_PROMPT,
)

extractor = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
    system_instruction=resume_extract_prompt
)


def custom_model(system_instruction: str, model_name: str = "gemini-1.5-pro", generation_config=None):
    """
    Creates a GenerativeModel for resume generation with dynamic system instructions.

    Args:
        system_instruction (str): The system instructions to guide the model.
        model_name (str): The name of the model to use. Defaults to "gemini-2.0-flash-exp".
        generation_config: Configuration for model generation. Defaults to None.

    Returns:
        genai.GenerativeModel: A configured model instance.
    """
    system_instruction += output_json
    model = genai.GenerativeModel(
        model_name=model_name,
        generation_config=generation_config,
        system_instruction=system_instruction
    )
    return model