import requests
import json
from google import genai
from google.genai import types
import os
#models
from models.roadmap import RoadmapResponseJSON
from models.skillgap import SkillGapAIResponse
#utils
from utils.gemini_config import model, custom_model,extractor, roadmap_model
from utils.prompts import ROADMAP_SYSTEM_PROMPT, SKILL_GAP_ANALYSIS_SYSTEM_PROMPT

API_KEY = os.getenv("GEMINI_API_KEY") 

def gemini_resume_generator(resume_details:str,job_details:str):
    query = f"Here is the resume details: {resume_details}.Here is the job details: {job_details}"
    print("Generating gemini response..")
    try:
        response = model.generate_content(query)
        try:
            json_data = json.loads(response.text)  
        except json.JSONDecodeError:
            json_data = {"~error": "Response is not valid JSON"}

        # Return the parsed JSON data
        return json_data    
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"error": "Failed to interact with Gemini AI"}

def generate_roadmap_with_gemini(skill:str):
    try:
        # response = roadmap_model.generate_content(f"Generate a roadmap for {skill}")
        client = genai.Client(api_key=API_KEY)
        query =f"Generate a roadmap for {skill} by following the above instructions"
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=ROADMAP_SYSTEM_PROMPT,
                top_p=0.7,
                top_k=40,
                temperature=0.5,
                thinking_config=types.ThinkingConfig(thinking_budget=5000),
                response_mime_type='application/json',
                response_schema=RoadmapResponseJSON
            ),
            contents=query,
        )
        try:
            json_data = json.loads(response.text)  
        except json.JSONDecodeError:
            json_data = {"error": "Response is not valid JSON"}

        # Return the parsed JSON data
        return json_data    
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"error": "Failed to interact with Gemini AI"}
        
def resume_generator_with_prompt(user_prompt,resume_details,job_details):
    query = f"Here is the resume details: {resume_details}.Here is the job details: {job_details}"
    try:
        model_instance = custom_model(user_prompt)
        response = model_instance.generate_content(query)
        candidate = response.candidates
        if not candidate:
            raise ValueError("No candidates found in response")
        
        text_content = candidate[0].content.parts[0].text
        if text_content.startswith("```json"):
            text_content = text_content.strip("```json").strip("```")
            
        try:
            json_data = json.loads(text_content)  
        except json.JSONDecodeError:
            json_data = {"error": "Response is not valid JSON"}

        # Return the parsed JSON data
        return json_data    
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"error": "Failed to interact with Gemini AI"}


def extract_resume(resume_info):
    try:
        query = f"Here is the resume details: {resume_info}.Send me the resume details in the mentioned JSON format exactly."
        response = extractor.generate_content(resume_info)
        try:
            json_data = json.loads(response.text)  
        except json.JSONDecodeError:
            json_data = {"error": "Response is not valid JSON"}
        return json_data
    except Exception as e:
        print(f"Error: {e}")

def generate_skill_gap_report(resume_details:str,job_description:str):
    try:
        client = genai.Client(api_key=API_KEY)
        query =f"Generate a skill gap analysis report in the given JSON format by following the above instructions.Here is the Job Description:\n{job_description} \nResume Details:\n {resume_details}"
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=SKILL_GAP_ANALYSIS_SYSTEM_PROMPT,
                top_p=0.7,
                top_k=40,
                temperature=0.5,
                thinking_config=types.ThinkingConfig(thinking_budget=1000),
                response_mime_type='application/json',
                response_schema=SkillGapAIResponse
            ),
            contents=query,
        )
        try:
            json_data = json.loads(response.text)  
            print(json_data)
        except json.JSONDecodeError:
            json_data = {"error": "Response is not valid JSON"}
        # Return the parsed JSON data
        return json_data    
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"error": "Failed to interact with Gemini AI"}