import os
from groq import Groq
from dotenv import load_dotenv
from fastapi import UploadFile, File
from google.cloud import texttospeech
from fastapi.responses import StreamingResponse
import io

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
     
async def speech_to_text(file: UploadFile = File(...))->str:
    transcription = client.audio.transcriptions.create(
      file=(file.filename, await file.read()),
      model="whisper-large-v3",
      response_format="json",
    )
    return transcription.text
  
async def text_to_speech(text: str):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",  # Changed to en-US
        name="en-US-Standard-C",  # Added specific voice name
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL  # Kept neutral as Standard-C is not gendered
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
    
    # Use io.BytesIO to create an in-memory file
    audio_stream = io.BytesIO(response.audio_content)

    # Return audio as a streaming response
    return StreamingResponse(audio_stream, media_type="audio/mpeg", headers={"Content-Disposition": "attachment; filename=output.mp3"})

