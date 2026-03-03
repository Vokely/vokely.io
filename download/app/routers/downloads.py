from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from utils.pdf_utils import generate_pdf

router = APIRouter()

class HTMLContent(BaseModel):
    html: str

@router.post("/generate-pdf")
async def generate_pdf_endpoint(html_content: HTMLContent):
    """
    API endpoint to generate a PDF from HTML content.
    - html: The HTML content to convert into a PDF.
    """
    try:
        pdf = await generate_pdf(html_content.html)
        # pdf = generate_pdf_with_weasyprint(html_content.html)

        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=component.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")