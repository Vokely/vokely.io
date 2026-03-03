from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
from bs4 import BeautifulSoup
import random
import time
import urllib.parse

async def simulate_human_behavior(page, min_time=1, max_time=2):
    """Simulate human-like delays and scrolling."""
    time.sleep(random.uniform(min_time, max_time))
    # for _ in range(random.randint(2, 4)):
    for _ in range(2):
        await page.mouse.wheel(0, random.randint(300, 500))
        time.sleep(random.uniform(min_time, max_time))
    print("Finsihed simulating human behaviour")

def extract_JD_from_indeed_url(jd_page):
    jd_soup = BeautifulSoup(jd_page, 'html.parser')
    job_description_div = jd_soup.find('div', id='jobDescriptionText')
    job_description_text = job_description_div.get_text(separator=' ')
    cleaned_text = ' '.join(job_description_text.split())

async def verify_human(new_tab):
        # Check if the "Verify you are human" checkbox exists and click it
        try:
            # Wait for the checkbox to appear
            print("waiting....")
            await new_tab.wait_for_selector('.error', timeout=3000)
            print('recgonized')
            # Click the checkbox
            await simulate_human_behavior(new_tab)
            await new_tab.click('label.cb-lb input[type="checkbox"]')
            print("Clicked the 'Verify you are human' checkbox.")
        except Exception as e:
            print("Checkbox not found or could not be clicked:", e)

async def wait_or_verify(new_tab):
    try:
        await new_tab.wait_for_selector("#jobDescriptionText", timeout=10000)
    except Exception as e:
        await verify_human(new_tab)
        wait_or_verify(new_tab)
        print(f"Error waiting for Indeed JD page to load: {e}")

async def extract_jobs_from_indeed(page, context, target_url):
    """Extract job postings from Indeed."""
    print(f"Navigating to Indeed URL: {target_url}")
    await page.goto(target_url)
    await simulate_human_behavior(page)

    try:
        await page.wait_for_selector(".job_seen_beacon", timeout=5000)
    except Exception as e:
        print(f"Error waiting for Indeed jobs to load: {e}")
        return []

    # Parse page content
    page_content = await page.content()
    soup = BeautifulSoup(page_content, 'html.parser')
    job_cards = soup.select(".job_seen_beacon")
    print(f"Found {len(job_cards)} job cards on Indeed.")

    # Extract job details
    jobs = []
    new_tab = await context.new_page()
    for card in job_cards:
        title_tag = card.select_one("h2.jobTitle a")
        company_tag = card.select_one("[data-testid='company-name']")
        location_tag = card.select_one("[data-testid='text-location']")

        job_link = title_tag['href'] if title_tag else None
        # parsed_url = urlparse(job_link)
        # query_params = parse_qs(parsed_url.query)
        # jk_value = query_params.get("jk", [None])[0]
        # job_link = f"https://www.indeed.com/viewjob?jk={jk_value}&from=serp&vjs=3"
        # description = ''
        # #Go to job link and scrape JD
        # if job_link:
        #     await new_tab.goto(job_link)
        #     await simulate_human_behavior(new_tab)
        #     await wait_or_verify(new_tab)
        #     page_content = await new_tab.content()
        #     description = extract_JD_from_indeed_url(page_content)
        # else:
        #     description= 'No Link available'
        #     print("No Job Link available")

        title = title_tag.get_text(strip=True) if title_tag else None
        company = company_tag.get_text(strip=True) if company_tag else None
        location = location_tag.get_text(strip=True) if location_tag else None

        if title or company or location:
            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                # "description" : description,
                "job_link": f"https://www.indeed.com{job_link}" if job_link else None
            })
    await new_tab.close()
    return jobs

async def indeed_job_scraper(skill: str, location: str, experience: int):
    target_indeed_url = f"https://www.indeed.com/jobs?q={urllib.parse.quote(skill)}&l={urllib.parse.quote(location)}"
    # target_linkedin_url = f"https://www.linkedin.com/jobs/{urllib.parse.quote(skill)}-jobs-{urllib.parse.quote(location)}"
    target_instahyre_url = "https://www.instahyre.com/search-jobs/"
    print(f"Skill: {skill}, Location: {location}, Experience: {experience}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            viewport={"width": random.randint(1024, 1920), "height": random.randint(768, 1080)},
            user_agent=f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{random.randint(90, 130)}.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        await stealth_async(page)

        # Initialize job listscontext
        indeed_jobs=[]

        try:
            # Extract jobs from Indeed
            indeed_jobs = await extract_jobs_from_indeed(page, context, target_indeed_url)
        except Exception as e:
            print(f"Error scraping Indeed: {str(e)}")
            
        # Close browser
        await browser.close()

        # Check if both failed
        if not indeed_jobs:
            raise Exception("Scraping failed for indeed")

        return {"indeed":indeed_jobs}
