import os
from datetime import datetime
import json
from dotenv import load_dotenv
from groq import Groq
from typing import Dict, List, Optional
import re
import numpy as np
from openai import OpenAI
#models
from models.groq_conclude import ConcludeFormat
from models.interview import InterviewExchange
#crud
from crud.interview import InterviewCRUD
from crud.resumes import update_resume_details

# Load environment variables
load_dotenv()
GROQ_MODEL = os.environ.get("GROQ_MODEL")

GPT_API_KEY = os.getenv("GPT_API_KEY")
gpt_client = OpenAI(api_key=GPT_API_KEY)  

class InteractiveInterviewer:
    def __init__(self,session_id, resume_data, resume_id, user_id,db):
        self.groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"), timeout=60)
        self.gpt_client = gpt_client
        self.conversation_history = []
        self.conversation_length = 0
        self.resume_data = resume_data
        self.resume_id = resume_id
        self.session_id = session_id
        self.interview_id = None
        self.interview_stage = "start"
        self.performance_list = []
        self.performance_rating = 0
        self.job_description = ""
        self.last_question = ""
        self.input_tokens = 0
        self.output_tokens = 0
        self.user_id = user_id
        self.max_score = 5
        self.interview_crud = InterviewCRUD(db)  

    async def set_job_description(self,jd:str):
        updated_resume = {
            "data" : self.resume_data,
            "name" : "Interview Resume",
            "job_description" : jd,
            "is_interview_specific" : True
        }
        await update_resume_details(updated_resume,self.resume_id,self.user_id)

    async def start_interview(self, job_description: str):
        parsed_resume = self.resume_data
        response_format = {
            "intro": "Your intro response",
            "ideal_answer" : "You are the interviewee and a top-tier candidate. Imagine you are attedning the interview. Give me an ideal response for the intro statement based on the user's resume and job description",
            "title": "A suitable Title based on the JD or Resume(if JD is not given)"
        }
        system_prompt = self._get_stage_specific_system_prompt()
        # Create a new session in the database if we have a CRUD instance
        if self.interview_crud and self.user_id and self.resume_id:
            self.interview_id = await self.interview_crud.create_session(
                user_id=self.user_id,
                resume_id=self.resume_id,
                session_id=self.session_id
            )

        messages = [{
            "role": "user",
            "content": f"""
            Here is their resume information: {json.dumps(parsed_resume, indent=2)}
            The job description they are interviewing for is:
            {job_description}
            JSON RESPONSE FORMAT:
            {response_format}
            """
        }]

        intro_response = await self._get_ai_response_intro(messages, system_prompt)
        # Create interview exchange object
        exchange = InterviewExchange(
            role="interviewer",
            content=intro_response["intro"],
            timestamp=datetime.now(),
            stage=self.interview_stage
        )
        if self.interview_crud and self.session_id:
            await self.interview_crud.update_history(self.session_id, exchange, intro_response["title"],intro_response["ideal_answer"])

        self.conversation_length += 1
        return intro_response

    async def generate_next_question(self, previous_answer: str = None):
        # Update stage before generating next question (to ensure proper question type)
        await self.update_interview_stage()
        if self.interview_stage == "finish":
            conclusion = await self.wrap_up_interview()
            return conclusion, None

        # Check if previous answer indicates confusion or lack of knowledge
        needs_help = False
        if previous_answer:
            lowercase_answer = previous_answer.lower()

            #Handle this case
            candidate_exchange = InterviewExchange(
                role="user",
                content=previous_answer,
                timestamp=datetime.now(),
                stage=self.interview_stage
            )
            # Add answer to conversation history
            self.conversation_history.append({
                "role": "user", 
                "content": previous_answer, 
                "timestamp": datetime.now().isoformat(),
                "stage": self.interview_stage
            })
            # Update database if we have a session
            if self.interview_crud and self.session_id:
                await self.interview_crud.update_history(self.session_id, candidate_exchange)

        # Get stage-specific system prompt
        system_prompt = self._get_next_question_prompt()
        messages = [{"role": "assistant" if msg["role"] == "interviewer" else "user", "content": msg["content"]} for msg in self.conversation_history[-2:]]

        # If the candidate needs help, prompt the AI to provide guidance before asking the next question
        # if needs_help:
        #     next_question_prompt = self._get_help_prompt() 
        # else:
        #     next_question_prompt = self._get_next_question_prompt()
        # system_prompt += next_question_prompt

        next_question = await self._get_ai_response(messages, system_prompt)
        next_question_text = next_question.get("next_response")
        ideal_answer = next_question.get("perfect_answer")
        self.last_question = next_question_text
        interviewer_exchange = InterviewExchange(
            role="interviewer",
            content=next_question_text,
            timestamp=datetime.now(),
            stage=self.interview_stage
        )

        self.conversation_history.append({
            "role": "interviewer", 
            "content": next_question_text, 
            "timestamp": datetime.now().isoformat(),
            "stage": self.interview_stage
        })
        # Update database if we have a session
        if self.interview_crud and self.session_id:
            await self.interview_crud.update_history(self.session_id, interviewer_exchange,None,ideal_answer)

        # Add performance rating to list
        pr = next_question.get("performance_rating")
        self.performance_list.append(pr)

        # Increment conversation length
        self.conversation_length += 1

        return next_question_text,ideal_answer

    async def wrap_up_interview(self,request):
        model="gpt-4.1-nano"
        await self.update_interview_stage()  # Make sure we're in the "finish" stage
        system_prompt = self.generate_early_exit_feedback_prompt() if len(self.conversation_history) <= 5 else self.generate_feedback_prompt()
        system_prompt += f"Here is the job description: {self.job_description}"
        if len(self.conversation_history) <= 5:
            system_prompt += f"Here is the user's resume : {self.resume_data}"

        messages = [{"role": "assistant" if msg["role"] == "interviewer" else "user", "content": msg["content"]} for msg in self.conversation_history]

        conclusion = await self._get_ai_response_conclude(messages, system_prompt,model)
        request.state.token_usage = {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "model": model,  # latest model overrides (optional)
        }
        feedback = str(conclusion.get("feedback"))
        # Create exchange for conclusion
        conclusion_exchange = InterviewExchange(
            role="interviewer",
            content=feedback,
            timestamp=datetime.now(),
            stage="finish"
        )

        # self.conversation_history.append({
        #     "role": "interviewer", 
        #     "content": feedback, 
        #     "timestamp": datetime.now().isoformat(),
        #     "stage": "finish"
        # })
        # Update database if we have a session
        if self.interview_crud and self.session_id:
            await self.interview_crud.update_history(self.session_id, conclusion_exchange)
            await self.interview_crud.add_feedback(self.session_id, feedback = conclusion)

        return conclusion

    async def _get_ai_response_intro(self, messages: List[Dict[str, str]], system_prompt: str):
        try:
            api_messages = [{"role": "system", "content": system_prompt}] + messages
            chat_completion = self.gpt_client.chat.completions.create(
                model="gpt-4.1-nano",  
                messages=api_messages,
                temperature=0.9,
                max_completion_tokens=2000,
                response_format= {"type": "json_object"}
            )

            # Logging the input and output tokens
            self.input_tokens += chat_completion.usage.prompt_tokens
            self.output_tokens += chat_completion.usage.completion_tokens

            response = chat_completion.choices[0].message.content.strip()
            introduction_data = json.loads(response)
            # Clean the introduction text
            clean_introduction = introduction_data["intro"].replace("\n", " ")
            title = introduction_data["title"]

            # Return both the introduction and title
            return {
                "intro": clean_introduction,
                "title": title,
                "ideal_answer" : introduction_data["ideal_answer"]
            }
        except Exception as e:
            return {
                "intro": f"I apologize, but I'm having trouble processing that. Let's start our interview. I'm Geneva, and I'll be conducting your interview today.",
                "title": "Professional Interview Session"
            }

    async def _get_ai_response(self, messages: List[Dict[str, str]], system_prompt: str):
        try:
            is_help_request = False
            response_format = """
            Generate the response strictly in the below JSON OUTPUT format:
            {
                "next_response": string,
                "performance_rating": int,
                "question_type": string,
            }
            """
            api_messages = [{"role": "system", "content": system_prompt + response_format}] + messages

            chat_completion = self.gpt_client.chat.completions.create(
                model="gpt-4.1-nano",  
                messages=api_messages,
                temperature=0.9,  # Allow for question variety
                max_completion_tokens=2000,
                response_format= {"type": "json_object"}
            )

            # Logging the input and output tokens
            self.input_tokens += chat_completion.usage.prompt_tokens
            self.output_tokens += chat_completion.usage.completion_tokens

            response_content = chat_completion.choices[0].message.content
            extracted_json = json.loads(response_content)
            # Add performance rating to list
            self.performance_list.append(extracted_json.get("performance_rating", 0))

            ideal_answer = await self.get_ideal_answer(messages, extracted_json.get("next_response", ""))
            return {
                "success": True,
                "next_response": extracted_json.get("next_response", ""),
                "perfect_answer": ideal_answer,
                "performance_rating": extracted_json.get("performance_rating", 5),
                "question_type": extracted_json.get("question_type", "general"),
            }
        except Exception as e:
            print(f"Error generating next question: {str(e)}")
            # Create a fallback response
            messages_content = [m["content"] for m in messages[-3:] if m["role"] == "user"]
            is_help_needed = any("don't know" in msg.lower() for msg in messages_content)

            if is_help_needed:
                fallback = "That's completely understandable. Let me approach this differently: Could you share a related experience that might demonstrate similar skills?"
                fallback_answer = "While I haven't faced that exact situation, I've dealt with similar challenges when [specific example]. I approached it by [methodology], which resulted in [positive outcome]. This experience taught me [relevant lesson] that I can apply to this role."
            else:
                fallback = "Tell me about a challenge you faced in your previous role and how you overcame it."
                fallback_answer = "In my previous role at [Company], I faced a significant challenge when [specific problem]. I addressed this by first analyzing the root cause, then collaborating with cross-functional teams to develop a solution. I implemented [specific action steps] which resulted in [measurable positive outcome]. This experience strengthened my [relevant skills] which would be valuable in this position."

            return {
                "success": False, 
                "error": str(e),
                "next_response": fallback,
                "perfect_answer": fallback_answer,
                "performance_rating": 5,
                "is_follow_up": is_help_needed
            }

    async def _get_ai_response_conclude(self, messages: List[Dict[str, str]], system_prompt: str,model):
        try:
            conclude_schema = ConcludeFormat.model_json_schema()
            enhanced_schema = f"""The JSON object must use the schema: {json.dumps(conclude_schema, indent=2)}
            Include specific, actionable feedback based on the candidate's responses throughout the interview.
            """

            api_messages = [{"role": "system", "content": system_prompt }] + messages
            chat_completion = self.gpt_client.chat.completions.create(
                model=model,  
                messages=api_messages,
                temperature=0.7,  # Allow for question variety
                max_completion_tokens=2000,
                response_format= {"type": "json_object"}
            )

            # Logging the input and output tokens
            self.input_tokens += chat_completion.usage.prompt_tokens
            self.output_tokens += chat_completion.usage.completion_tokens
            await self.interview_crud.update_session_metrics(self.session_id, self.get_performance_rating(), self.input_tokens, self.output_tokens)

            # response_content = ConcludeFormat.model_validate_json(chat_completion.choices[0].message.content)
            response = chat_completion.choices[0].message.content
            json_data = json.loads(response)

            return json_data
        except Exception as e:
            # Fallback response if something goes wrong
            avg_rating = self.get_performance_rating()
            return {
                "success": True,
                "conclusion": "Thank you for participating in this interview. I appreciate your time and responses.",
                "feedback": "Based on our conversation, I see potential in your candidacy. Focus on providing more specific examples of your accomplishments in future interviews.",
                "performance_rating": avg_rating
            }
            
    async def get_ideal_answer(self, messages: List[Dict[str, str]], question: str):
        system_prompt = """
        Imagine you are attending an interview. 
        You will be given a conversation history and a question.
        Give me an ideal response for the question based on the given resume and job description.
        Do not answer anything irrelvent other than the question.
        Use active voice and be concise.
        Keep the answer under 3 lines and straightforward.
        Use STAR format if you are answering a question that includes a scenario.(Situation, Task, Action, Result).
        Give me the output strictly in this JSON format:
        {
            "ideal_answer": "Your ideal answer for the question based on the resume and job details"
        }
        """
        system_prompt += f"Here is the question: {question}. Here is the resume details: {self.resume_data} and the job description: {self.job_description}"
        messages.append({
            "role": "system", 
            "content" : system_prompt
        })
        api_messages = [{"role": "system", "content": system_prompt}]
        chat_completion = self.gpt_client.chat.completions.create(
            model="gpt-4.1-nano",  
            messages=api_messages,
            temperature=0.9,
            response_format={"type": "json_object"},
            max_completion_tokens=2000
        )
        self.input_tokens += chat_completion.usage.prompt_tokens
        self.output_tokens += chat_completion.usage.completion_tokens
        ideal_answer = chat_completion.choices[0].message.content.strip()
        formatted_json = json.loads(ideal_answer)
        return formatted_json.get("ideal_answer", "")
        
    def get_conversation_history(self):
        return self.conversation_history

    def get_performance_rating(self) -> float:
        if len(self.performance_list) > 0:
            mean_score = np.mean(self.performance_list)
            percentage = (mean_score / self.max_score) * 100
            self.performance_rating = np.around(percentage, 2)
        else:
            self.performance_rating = 0.0

        return self.performance_rating

    def get_interview_stage(self) -> str:
        return self.interview_stage

    async def update_interview_stage(self):
        # More nuanced stage transitions based on conversation length
        if self.conversation_length <= 2:
            self.interview_stage = "start"  # Introduction and initial rapport building
        elif self.conversation_length <= 4:
            self.interview_stage = "experience"  # Experience and background questions
        elif self.conversation_length <= 7:
            self.interview_stage = "technical"  # Technical and skills assessment
        elif self.conversation_length <= 9:
            self.interview_stage = "behavioral"  # Behavioral and situational questions
        else:
            self.interview_stage = "finish"  # Wrapping up

    def _get_stage_specific_system_prompt(self,include_base_prompt=True) -> str:
        """Returns a stage-specific system prompt to guide the AI."""
        base_prompt = self._get_interview_prompt()
        stage_prompts = {
            "start": """
                You're at the beginning of the interview. 
                Focus on building rapport and making the candidate comfortable.
                Ask light introductory questions about their background and interest in the position.
                Keep responses warm, welcoming, and under three lines.
                Highlight something positive from their resume.
            """,  # provide a helpful suggestion or rephrase it
            "experience": """
                You're in the experience assessment phase.
                Ask specific questions about their work history relevant to the job description.
                Probe for details about projects, responsibilities, and achievements.
                Questions should be direct and focused on how their experience relates to the role.
                If they don't have specific experience, help them identify transferable skills.
                When candidates struggle, move onto next question.
            """,  # offer guidance on how to approach the question
            "technical": """
                You're in the technical assessment phase.
                Ask questions that evaluate the candidate's technical skills and knowledge.
                Frame questions around specific technologies or methodologies mentioned in the resume or job description.
                Include scenario-based questions that test problem-solving abilities.
                If they don't know an answer, move onto next question and be kind.
                Be supportive when candidates are unsure - move onto next question and be kind.
            """,#If they don't know an answer, provide a hint or suggestion about how to think about the problem.
                # Be supportive when candidates are unsure - suggest alternative ways they might approach the question.
            "behavioral": """
                You're in the behavioral assessment phase.
                Ask questions that evaluate soft skills, teamwork, conflict resolution, and adaptability.
                Include situational questions that reveal the candidate's approach to workplace challenges.
                Look for evidence of their alignment with company culture and values.
                When candidates can't think of an example, suggest they consider scenarios from education, volunteering, or personal projects.
                Provide framework suggestions (like STAR method) if they seem to struggle with behavioral questions.
            """,
            "finish": """
                You're concluding the interview.
                Provide a brief summary of the conversation.
                Offer specific, constructive feedback based on their responses.
                Be encouraging while honest about areas for improvement.
                Thank them for their time and mention next steps in a general way.
                Acknowledge areas where they showed growth or adaptability during the interview itself.
            """,
        }
        if not include_base_prompt:
            return stage_prompts.get(self.interview_stage)
        return f"{base_prompt}\n + Interview Stage:{self.interview_stage}\n{stage_prompts.get(self.interview_stage)}"

    def _get_interview_prompt(self) -> str:
        """Returns the enhanced interview prompt."""
        return """
        You are Geneva, a professional interviewer conducting a realistic job interview.
        
        Your goal is to create a comfortable yet professional environment, helping the candidate feel confident while thoroughly assessing their qualifications.
        
        Tone and Approach:
        - Keep responses natural, engaging, supportive, and under three lines.
        - Always Use the candidate's name to personalize the experience.
        - Be conversational but focused - avoid corporate jargon or robotic language.
        - Never repeat the candidate's answers or restate resume details.
        - When candidates say they don't know an answer, move onto next question.
        
        Interview Flow:
        1. Introduction – Briefly introduce yourself and set a relaxed yet structured tone. Mention something specific and positive from their resume to build report.
        
        2. Experience and Skills – Ask resume-based questions that directly connect to the job description. Focus on relevant experience and follow up for depth.
        
        3. Technical Assessment – For technical roles, include questions that evaluate core competencies mentioned in the job description.
        
        4. Scenario-Based Evaluation – Use situational and behavioral questions to assess problem-solving and adaptability in real-world contexts.
                
        5. Closing – End on a motivating note with specific positive feedback about their responses.
        
        Your ultimate goal is to simulate a real interview experience that leaves the candidate feeling prepared and confident for actual job interviews.
        """
    def _get_next_question_prompt(self) -> str:
        """Returns the next interview question, considering the current stage."""
        stage_prompt = self._get_stage_specific_system_prompt(include_base_prompt=False)
        core_prompt = """
        Core Objective: Based on the entire conversation history and the candidate's most recent message, generate a contextually relevant and engaging response (either a question or a conversational statement) to continue the interview smoothly, considering the current interview stage.

        Key Responsibilities & Guidelines:
        1.  Understand Context Deeply:
            Thoroughly analyze the entire conversation history, paying close attention to the candidate's most recent message.
            Consider the job description, the candidate's resume (if available or inferred), and the current interview stage.

        2.  Generate the Next Interview Element:
            Based on the current interview stage ("{interview_stage}") and the stage-specific guidance:
            {stage_prompt}

            If the candidate has just answered a question:
            Determine if it's appropriate to ask a follow-up question, transition to a new topic relevant to the current stage, or provide a brief conversational response.

            If the candidate has just made a statement or asked a question:
            Formulate a relevant question or a brief conversational response that encourages them to elaborate or moves the interview forward according to the current stage.

            Question Guidelines (if generating a question):
            * Relevance is Key: The question MUST be directly relevant to the job description, the candidate's resume/experience discussed, and the current interview stage.
            * Conciseness and Clarity: Frame questions clearly and concisely, ideally under 2 sentences. Avoid ambiguity.
            * Avoid Repetition: Do not ask generic questions or questions that have already been effectively answered.
            * Technical Depth (for technical roles): If the current stage is "technical," ask questions that probe the candidate's technical understanding and problem-solving skills. Adjust depth based on the role's seniority and requirements.
            * Behavioral Insight (for "behavioral" stage): Aim to understand the candidate's past actions and decision-making processes (e.g., implicitly using the STAR method).
            * Follow-up for Clarity: If the candidate's previous answer was vague, incomplete, or warrants further exploration, ask a targeted follow-up question.
            * Natural Flow: Ensure questionsa transition smoothly from the previous topic or answer.

            Conversational Response Guidelines (if not asking a question):
            * Supportive and Empathetic Tone: Use kind, empathetic, and encouraging language. Acknowledge the candidate's points.
            * Maintain Engagement: Your response should encourage the candidate to continue or signal a transition. Examples: "That's helpful to know.", "Thanks for that explanation.", "I understand. Let's move on to...", "That gives me more context on..."
            * Avoid Irrelevance: Ensure your response is directly tied to the ongoing conversation and the interview's purpose within the current stage.
            * Brevity: Keep these responses brief and to the point.

        3.  Adhere to Interviewer Persona:
            Maintain a professional, yet approachable and human-like demeanor.
            Be supportive and aim to create a positive interview experience.
            Listen actively (by processing the candidate's input thoroughly).

        4.  Strictly Avoid Irrelevant Output:
            Under no circumstances should you generate responses that are off-topic, generic (if a specific response is warranted), or unrelated to the interview context and current stage.
            If the candidate's response is unclear or irrelevant, gently guide them back on track with your next response or question, keeping the current stage in mind.
            Always respond in the format of the next question or a brief conversational statement.
        """
        return core_prompt.format(interview_stage=self.interview_stage, stage_prompt=stage_prompt)

    def _get_help_prompt(self) -> str:
        """Returns a prompt specifically for handling cases where candidates don't know an answer."""
        return f"""
        I notice you're unsure about the previous question. 
        
        Generate a response that:
        1. Acknowledges that it's okay not to have an immediate answer
        2. Provides a helpful suggestion or framework for approaching the question
        3. Go to next question
        
        Current interview stage: {self.interview_stage}
        Last question: {self.last_question}
        
        Keep your response supportive, natural, and under 3 lines. 
        
        Return a JSON object with:
        1. "next_response": Your supportive response + new/rephrased question
        3. "performance_rating": Rate the candidate's attempt (typically 3-5 for "I don't know" responses)
        4. "question_type": The category of question (same as the original question)
        """
    def generate_feedback_prompt(self) -> str:
        """Returns a system prompt for generating interview feedback."""
        return """
        Core Objective: Analyze the complete interview conversation history to provide structured and personalized feedback to the candidate.

        Analysis and Feedback Generation Process:

        1.  Comprehensive Conversation Analysis:
            - Meticulously review the entire interview transcript, turn by turn.
            - For each of the candidate's responses, identify:
                - Key skills, experiences, and knowledge demonstrated.
                - Examples of their approach to situations (using the STAR method implicitly or explicitly).
                - Communication style and clarity.
                - Level of confidence conveyed.
                - Potential indicators of cultural fit based on their interactions and values expressed.
                - Alignment of their responses with the requirements outlined in the Job Description (JD).

        2.  Identify Strengths:
            - Based on the analysis, extract specific examples and patterns that highlight the candidate's strengths.
            - Frame strengths positively and relate them to the requirements of the Job Description whenever possible.
            - Aim for concrete examples from the conversation to support each identified strength.

        3.  Identify Areas for Improvement:
            - Pinpoint specific instances or patterns where the candidate could have provided more comprehensive, relevant, or clearer responses.
            - Frame feedback constructively and focus on development. Avoid judgmental language.
            - Suggest concrete actions or approaches the candidate could consider for future interviews or professional development, ideally linked to the JD.
            - Prioritize areas for improvement that are most relevant to the role.

        4.  Assess Key Evaluation Metrics:
            - For every metric provide a score on a scale of 0.0 to 10.0 (0.0 being low, 10.0 being high).
            - Confidence: Evaluate the candidate's self-assurance and conviction in their responses based on their language and tone throughout the interview. 
            - Communication: Assess the clarity, conciseness, and effectiveness of the candidate's communication. Consider their articulation, active listening (if applicable), and overall professionalism in language. 
            - Cultural Fit:Determine the alignment of the candidate’s values, work style, and interpersonal tone with a typical organizational/team environment. Use a judgment based on tone, attitude, and relevant expressions;
            - Team Player: Evaluate the candidate's collaborative mindset, openness to feedback, and examples or language that reflect working effectively with others (if applicable).
            - Problem Solving:Assess analytical thinking, creativity in addressing challenges, and ability to generate logical and relevant solutions (based on answers to situational or technical questions
            - Leadership: Evaluate initiative, decision-making, ownership, or the ability to guide or influence others.

        5.  JD Alignment Summary:
            - For each key requirement or skill mentioned in the Job Description(minimum 3- maximum 5):
                - Briefly assess the extent to which the candidate's responses and experiences demonstrated proficiency or potential in a particular skill mentioned in the JD or a specific area.
                - Provide a short qualitative assessment (e.g., "Strong evidence demonstrated through X project," "Limited direct experience, but transferable skills mentioned," "No specific examples provided").

        6.  Structure the Feedback in JSON Format:
            - Present the final feedback strictly in the following JSON format:
            ```json
            {
                "conclusion": "A brief concluding statement about the interview",
                "feedback": "A concise single-paragraph summary of overall strengths and areas for improvement",
                "strengths": ["Strength 1 with supporting example", "Strength 2 related to JD"],
                "areas_for_improvement": ["Area 1 with suggestion", "Area 2 for development"],
                "confidence": numerical score from 0.0 to 10.0 (e.g., 7.5),
                "communication": numerical score from 0.0 to 10.0 (assessing clarity, articulation, listening skills, and overall effectiveness of communication),
                "problem_solving": numerical score from 0.0 to 10.0 (evaluating analytical thinking, approach to challenges, and solution generation),
                "team_player": numerical score from 0.0 to 10.0 (assessing collaborative attitude, ability to work with others, and contribution to team dynamics, if evident),
                "cultural_fit": numerical score from 0.0 to 10.0 (evaluating alignment with typical company values and team environment, based on interaction style and responses),
                "technical_skills": numerical score from 0.0 to 10.0 (assessing proficiency in relevant technical areas discussed or demonstrated; score N/A if not applicable/assessable from the conversation),
                "team_player": numerical score from 0.0 to 10.0 (evaluate collaboration, openness to feedback, teamwork orientation),
                "leadership": numerical score from 0.0 to 10.0 (assessing potential for taking initiative, guiding others, and decision-making capabilities, if evident; score N/A if not applicable/assessable),
                "jd_alignment_summary": {
                    "[JD Requirement 1]": "[Assessment]",
                    "[JD Requirement 2]": "[Assessment]",
                    "...": "..."
                }
            }
            ```

        7.  Maintain a Professional and Constructive Tone:
            - Ensure the language used is professional, encouraging, and focused on the candidate's growth and development.
            - Avoid overly negative or critical phrasing.
            - Always use "you" and "your" while generating feedback and conclusion.
        """
    def generate_early_exit_feedback_prompt(self) -> str:
        """Returns a system prompt for generating feedback for an early interview exit with JD and resume context."""
        return """
            Core Objective:
            The candidate exited the interview early or did not participate. Based on the Job Description, Resume (if available), and any part of the interview conversation that occurred, generate a constructive and professional evaluation.

            Your responsibilities:
            - Acknowledge the early exit professionally.
            - Summarize any conversation that occurred before the exit. If no conversation is available, clearly state that.
            - Provide a concise overall summary of the interview outcome.
            - Highlight minimum 3 strengths-max 5 (specify from where is it derived-resume/interview).
            - Identify areas for improvement.
            - Suggest next steps or skills to develop based on JD alignment.
            - Assign numerical scores less than 5.0 for all metrics (or 0.0 if not assessable).
            - Extract 3-5 key skills mentioned in the JD which could be technical or behavorial.
            - Now compare the candidate's resume and conversation to each of the skills you extracted above and evaluate how well the candidate meets each of the skills.
            - Ensure that strengths and areas for improvement are tied to the JD alignments.

            Important: Return the output strictly in the following JSON format:

            JSON Format:
            {
                "summary": "One-paragraph summary of the interview conversation (or a statement that none occurred)",
                "conclusion": "A brief concluding statement about the interview",
                "feedback": "A concise single-paragraph summary of overall strengths and areas for improvement",
                "strengths": [
                    "Strength 1 inferred from resume or interview (add if it is based on resume/interview)",
                    "Strength 2 tied to a JD requirement (add if it is based on resume/interview)"
                ],
                "areas_for_improvement": [
                    "Area 1 with actionable suggestion (linked to relevant JD requirement)",
                    "Area 2 with growth advice (linked to relevant JD requirement)"
                ],
                "confidence": numerical score from 0.0 to 5.0,
                "communication": numerical score from 0.0 to 5.0,
                "problem_solving": numerical score from 0.0 to 5.0,
                "team_player": numerical score from 0.0 to 5.0,
                "cultural_fit": numerical score from 0.0 to 5.0,
                "technical_skills": numerical score from 0.0 to 5.0,
                "leadership": numerical score from 0.0 to 5.0,
                "jd_alignment_summary": {
                    "Extracted JD-skill 1": "Brief assessment - (add if it is based on resume/interview)",
                    "Extracted JD-skill 2": "Brief assessment - (add if it is based on resume/interview)",
                    "Extracted JD-skill 3": "Brief assessment - (add if it is based on resume/interview)",
                    "... up to 5 total"
                }
            }

            Guidelines:
            - If any interview discussion occurred before the exit, summarize it briefly under "summary".
            - If no interaction occurred, state: "No interview conversation was available for assessment."
            - In summary mention that the analysis is based on user's resume and job description to avoid any consfusion.
            - Strengths and improvement areas should be based on or tied to the listed JD requirements.
            - All scores should be below 5.0 as the candidate exited early.
            - Use a professional and constructive tone.
            - Always use "candidate" when referring to the user.
        """