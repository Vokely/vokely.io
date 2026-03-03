from playwright.async_api import async_playwright, Browser
from weasyprint import HTML
import asyncio

# Semaphore to allow only 4 concurrent PDF generations
semaphore = asyncio.Semaphore(10)

# Persistent browser instance
playwright = None
browser: Browser | None = None

async def get_browser() -> Browser:
    global playwright, browser
    if not browser:
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=True)
    return browser

async def close_browser():
    global playwright, browser
    if browser:
        await browser.close()
        browser = None
    if playwright:
        await playwright.stop()
        playwright = None

async def generate_pdf(html: str) -> bytes:
    if not html:
        raise ValueError("HTML content is required")

    async with semaphore:  # Limit concurrency
        try:
            browser = await get_browser()
            page = await browser.new_page()

            await page.set_content(html, wait_until="load")
            await page.wait_for_timeout(1000)  # Wait for JS/rendering if needed

            pdf = await page.pdf(
                format="A4",
                print_background=True,
            )
            await page.close()
            return pdf

        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")

def generate_pdf_with_weasyprint(html: str, output_path: str = None) -> bytes:
    """
    Generate a PDF from HTML content using WeasyPrint.
    - html: The HTML content to convert into a PDF.
    - output_path: Optional path to save the PDF file.
    - Returns: PDF as bytes.
    """
    if not html:
        raise ValueError("HTML content is required")

    try:
        print("Download via weasyprint")
        pdf_bytes = HTML(string=html).write_pdf()
        if output_path:
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
        return pdf_bytes
    except Exception as e:
        raise Exception(f"Failed to generate PDF using WeasyPrint: {str(e)}")