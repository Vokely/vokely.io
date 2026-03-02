from PyPDF2 import PdfReader
from docx import Document
from fastapi import HTTPException, UploadFile, File, Request
from utils.deepseek import get_resume_details
from utils.gemini import extract_resume
from utils.gpt import extract_resume_details
import os
import re
import json
from dotenv import load_dotenv
from utils.groq import groq_resume_extractor
# for pdf-ocr
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

MAX_FILE_SIZE_MB = 5
MAX_PAGES = 10
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}

load_dotenv()
DEFAULT_MODEL = os.getenv("DEFAULT_AI_MODEL")


async def construct_resume_details(request:Request,file: UploadFile, model: str = DEFAULT_MODEL):
    """
    Main handler that reads file once and passes bytes through the pipeline.
    """
    # Read file contents once
    file_bytes = await file.read()
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # Validate file with bytes
    validate_resume_file(file_bytes, file_extension, file.filename)
    
    # Extract content from bytes
    cleaned_content = extract_content_from_bytes(file_bytes, file_extension, file.filename)
    
    if os.getenv("DEV_MODE")=="local":
        model = "groq"
    
    # Process with selected model
    if model == "groq":
        extracted_details = await groq_resume_extractor(request,cleaned_content)
    elif model == "gpt":
        extracted_details = await extract_resume_details(request,cleaned_content)
    elif model == "gemini":
        extracted_details = extract_resume(cleaned_content)
    elif model == "deepseek":
        extracted_details = get_resume_details(cleaned_content)
    else:
        raise HTTPException(status_code=400, detail="Invalid model specified")
    
    return extracted_details


def validate_resume_file(file_bytes: bytes, file_extension: str, filename: str) -> None:
    """
    Validate file using bytes without re-reading from upload.
    """
    # 1. Validate file extension
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_extension}'. Only PDF, DOC, DOCX, and TXT are allowed."
        )
    
    # Handle empty uploads
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty. Please upload a valid resume.")
    
    # 2. Check file size
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB limit")
    
    # 3. For PDFs only, check number of pages
    if file_extension == ".pdf":
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            num_pages = doc.page_count
            doc.close()
            
            if num_pages > MAX_PAGES:
                raise HTTPException(status_code=400, detail=f"Resume exceeds {MAX_PAGES} pages")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF content: {str(e)}")


def extract_content_from_bytes(file_bytes: bytes, file_extension: str, filename: str) -> str:
    """
    Extract and clean content from file bytes without saving to disk.
    """
    try:        
        # Extract content based on file type
        if file_extension == ".pdf":
            content = read_pdf_from_bytes(file_bytes)
        elif file_extension == ".docx":
            content = read_docx_from_bytes(file_bytes)
        elif file_extension == ".txt":
            content = read_txt_from_bytes(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a .pdf, .docx, or .txt file."
            )
        
        # Clean up content
        cleaned_content = clean_content(content)
        return cleaned_content
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def read_pdf_from_bytes(file_bytes: bytes) -> str:
    """Read text content from PDF bytes, using OCR when needed."""
    text_content = []
    
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            
            # If normal text is found, use it
            if text.strip():
                text_content.append(text)
            else:
                # Perform OCR on page image
                pix = page.get_pixmap(dpi=300)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                ocr_text = pytesseract.image_to_string(img)
                text_content.append(ocr_text)
        
        doc.close()
        return "\n".join(text_content)
        
    except Exception as e:
        raise Exception(f"Error reading PDF: {e}")


def read_docx_from_bytes(file_bytes: bytes) -> str:
    """Read text content from DOCX bytes."""
    try:
        # Document can read from BytesIO
        document = Document(io.BytesIO(file_bytes))
        content = "\n".join([paragraph.text for paragraph in document.paragraphs])
        return content
    except Exception as e:
        raise Exception(f"Error reading DOCX: {e}")


def read_txt_from_bytes(file_bytes: bytes) -> str:
    """Read text content from TXT bytes."""
    try:
        # Try UTF-8 first, fall back to other encodings if needed
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1')
    except Exception as e:
        raise Exception(f"Error reading TXT: {e}")


def clean_content(content: str) -> str:
    """
    Clean up extracted content by removing unwanted spaces, extra lines, and excessive whitespace.
    """
    try:
        # Remove excessive whitespace, multiple spaces, and replace with a single space
        content = re.sub(r"\s+", " ", content)
        # Strip leading and trailing spaces
        content = content.strip()
        return content
    except Exception as e:
        raise Exception(f"Error cleaning content: {e}")


def sanitation(job_description: str) -> str:
    """
    Clean empty lines and unnecessary symbols (!, bullet points) from the job description.
    """
    try:
        lines = [line.strip() for line in job_description.splitlines() if line.strip()]
        
        # Remove bullet points and exclamatory marks
        cleaned_lines = []
        for line in lines:
            cleaned_line = line.lstrip('-•*').replace('!', '')  # Remove common bullet points
            cleaned_lines.append(cleaned_line.strip())
        
        # Join lines into a single paragraph
        paragraph = ' '.join(cleaned_lines)
        return paragraph
    except Exception as e:
        return job_description