from fastapi import HTTPException
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
from bs4 import BeautifulSoup
import random
import time
import urllib.parse
import os
import requests
from urllib.parse import urlencode, urlparse, parse_qs

async def simulate_human_behavior(page, min_time=1, max_time=2):
    """Simulate human-like delays and scrolling."""
    time.sleep(random.uniform(min_time, max_time))
    # for _ in range(random.randint(2, 4)):
    for _ in range(2):
        await page.mouse.wheel(0, random.randint(300, 500))
        time.sleep(random.uniform(min_time, max_time))
    print("Finsihed simulating human behaviour")

def split_company_and_job_title(input_string):
    # Split the string at the first occurrence of '-'
    parts = input_string.split('-', 1)
    
    # Strip any leading/trailing whitespace from the results
    company_name = parts[0].strip()
    job_title = parts[1].strip() if len(parts) > 1 else None
    
    return company_name, job_title

def get_jd_details_from_instahyre(employer_id):
    employer_url = f"https://www.instahyre.com/api/v1/employer_public_jobs/{employer_id}"
    # print(f"Employer Url:{employer_url}")
    headers = {
        "User-Agent": f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{random.randint(90, 130)}.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    response = requests.get(employer_url,headers=headers)
    if(response.status_code == 200):
        data = response.json()
        description = data.get("description")
        soup = BeautifulSoup(description, 'html.parser')
        jd_text = soup.get_text(separator=' ')
        jd_text = ' '.join(jd_text.split())

        link = "https://www.instahyre.com" + data.get("opportunity_url")
        return jd_text, link
    else:
        print(f"No description available:{employer_id}")
        return ("No description available", "No link available")

def get_instahyre_jobs_from_API(skills, location, experience):
    # Base API endpoint
    base_url = "https://www.instahyre.com/api/v1/job_search"
    
    #JOB TYPE: 0- FTE and intern, 1- FTE, 2-Interns
    # Query parameters
    params = {
        "company_size": 0,
        "isLandingPage": True,
        "job_type": 0,
        "offset": 0,
        "search" : True,
        "skills": skills,
        "location" : location,
        "experience" : experience
    }
    query_string = urlencode(params)

    headers = {
        "User-Agent": f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{random.randint(90, 130)}.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    # Append the query string to the base URL
    full_url = f"{base_url}?{query_string}"
    print(full_url)
    results = []
    try:
        response = requests.get(full_url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            jobs = data.get("objects", [])  
            print(f"{len(jobs)} Jobs found from Instahyre")
            #Get JD
            for job in jobs:
                job_title = job.get("title")  
                location = job.get("locations")
                company = job.get("employer",{}).get("company_name")
                skills = job.get("keywords")
                employer_id = job.get("id") 
                description, link = get_jd_details_from_instahyre(employer_id)
                
                results.append({
                    "job_title": job_title,
                    "location": location,
                    "company": company,
                    "skills": skills,
                    "description": description,
                    "link": link
                })
            return results
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# async def extract_jobs_from_instahyre(page,target_url):
#     """Extract jobs from INSTAHYRE"""
#     await page.goto(target_url, wait_until='networkidle')  # Wait for navigation to finish
#     # await simulate_human_behavior(page)
#     try:
#         await page.wait_for_selector(".row", state='visible',timeout=10000)
#     except Exception as e:
#         print(f"Error waiting for Indeed jobs to load: {e}")
#         return []
#     # Parse page content
#     page_content = await page.content()
#     soup = BeautifulSoup(page_content, 'html.parser')
#     job_cards = soup.select(".row")
#     print(f"Found {len(job_cards)} job cards on INSTAHYRE.")

#     # Extract job detassils
#     jobs = []
#     for card in job_cards:
#         title = card.select_one("employer-job-name")
#         job_skills_div = soup.find('div', class_='job-skills ng-scope')
#         skills_required = job_skills_div.find_all('li')
#         employer_locations_div = soup.find('div', class_='employer-locations')
#         location_span = employer_locations_div.find('span', class_='ng-binding ng-scope')
#         location = location_span.text.strip() if location_span else None

#         company, job_title = split_company_and_job_title(input_string)
#         jobs.append({
#             "title": job_title,
#             "company": company,
#             "location": location,
#             # "job_link": f"{LINKEDIN_URL}{job_link}" if job_link else None,
#             # "job_description" : description if description else None
#         })
#     return jobs

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


# async def extract_jobs_from_linkedin(page, context, target_url):
    # """Extract job postings from LinkedIn."""
    # print(f"Navigating to LinkedIn URL: {target_url}")
    # await page.goto(target_url)
    # await simulate_human_behavior(page)

    # # Check if login is required
    # sign_in_button = page.locator('a.nav__button-secondary:has-text("Sign in")')
    # if await sign_in_button.is_visible():
    #     print("Login required. Proceeding to login...")
    #     await sign_in_button.click()
    #     await simulate_human_behavior(page)
    #     await page.fill('input[name="session_key"]', os.getenv("LINKEDIN_USERNAME"))
    #     await page.fill('input[name="session_password"]', os.getenv('LINKEDIN_PASSWORD'))
    #     await page.locator('button.btn__primary--large:has-text("Sign in")').click()
    #     await simulate_human_behavior(page)

    # # Open a new tab for LinkedIn search
    # new_tab = await context.new_page()
    # await new_tab.goto(target_url)
    # await simulate_human_behavior(new_tab)
    # # Parse page content
    # page_content = await new_tab.content()

    # soup = BeautifulSoup(page_content, 'html.parser')
    # job_cards = soup.select("li.ember-view")
    # job_cards = soup.select("div.job-card-container")
    # print(f"Found {len(job_cards)} job cards on LinkedIn.")

    # # Extract job detassils
    # jobs = []
    # for card in job_cards:
    #     title_tag = card.select_one(".job-card-container__link span[aria-hidden='true']")
    #     company_tag = card.select_one(".artdeco-entity-lockup__subtitle span")
    #     location_tag = card.select_one(".artdeco-entity-lockup__subtitle span")

    #     job_link = card.select_one(".job-card-container__link")['href'] if title_tag else None
    #     title = title_tag.get_text(strip=True) if title_tag else None
    #     company = company_tag.get_text(strip=True) if company_tag else None
    #     location = location_tag.get_text(strip=True) if location_tag else None

    #     job_link = LINKEDIN_URL + job_link
    #     print(f"Navigation into JD page: {job_link}")
    #     jd_tab = await context.new_page()
    #     await jd_tab.goto(job_link)
    #     description_page = await jd_tab.content()
    #     print("Scraping new tab content")
        
    #     soup = BeautifulSoup(description_page, 'html.parser')
    #     description_div = soup.find("div", class_="mt4")
    #     if(description_div):
    #         description = description_div.get_text(strip=True)
    #     else:
    #         description = "Not Found"
    #     print(description)

    #     if title or company or location:
    #         jobs.append({
    #             "title": title,
    #             "company": company,
    #             "location": location,
    #             "job_link": f"{LINKEDIN_URL}{job_link}" if job_link else None,
    #             "job_description" : description
    #         })
    #     jd_tab.close()

    # await new_tab.close()
    # return jobs

async def get_jobs_from_naukari(skills,location,experience):
    # url = "https://www.naukri.com/react-dot-js-jobs-in-chennai?k=react.js&l=chennai&experience=1"
    url = "https://www.naukri.com/jobapi/v3/search"
    headers = {
        "accept": "application/json",
        "accept-language": "en,ta;q=0.9",
        "appid": "109",
        "cache-control": "no-cache",
        "clientid": "d3skt0p",
        "content-type": "application/json",
        "gid": "LOCATION,INDUSTRY,EDUCATION,FAREA_ROLE",
        # "nkparam": "Oc6IOo3nQODFkMZcOQC6FTHCqPqcH5y9GEO2waDRaAR1IObaG/itjj1iABZ+U/Yb6JZwin/GbcWdwdoiOPPTQw==",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": f"https://www.naukri.com/{skills}-jobs-in-{location}?k={skills}&l={location}&experience={experience}",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "systemid": "Naukri",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    }
    params = {
        "noOfResults": 20,
        "urlType": "search_by_key_loc",
        "searchType": "adv",
        "location": location,
        "keyword": skills,
        "pageNo": 1,
        "experience": experience,
        "k": skills,
        "l": location,
        "seoKey": f"{skills}-jobs-in-{location}",
        "src": "directSearch",
    }

    response = requests.get(url, headers=headers, params=params)
    all_jobs = []
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from Naukri")
    else:
        data = response.json()  
        job_details = data.get("jobDetails")
        print(f"{len(job_details)} jobs found in naukari")

        for job in job_details:
            title = job["title"]
            company = job['companyName']
            skills = job.get("tagsAndSkills", None)
            placeholders = job.get("placeholders", [])  
            experience = placeholders[0]["label"] if len(placeholders) > 0 and placeholders[0]["type"] == "experience" else None
            location = placeholders[2]["label"] if len(placeholders) > 2 and placeholders[2]["type"] == "location" else None
            link = job['jdURL']

            all_jobs.append({
                "title": title,
                "company": company,
                "skills": skills,
                "experience": experience if experience else None,
                "location": location if location else None,
                "link": f"https://www.naukri.com{link}"
            })
    return all_jobs

async def job_scraper(skill: str, location: str, experience: int):
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
        indeed_jobs, linkedin_jobs, instahyre_jobs, naukari_jobs = [], [], [], []

        try:
            # Extract jobs from Indeed
            indeed_jobs = await extract_jobs_from_indeed(page, context, target_indeed_url)
        except Exception as e:
            print(f"Error scraping Indeed: {str(e)}")

        # try:
        #     # Extract jobs from LinkedIn
        #     linkedin_jobs = await extract_jobs_from_linkedin(page, context, target_linkedin_url)
        # except Exception as e:
        #     print(f"Error scraping LinkedIn: {str(e)}")

        print(f"Starting Instahyre")
        try:
            # Extract jobs from InstaHyre
            instahyre_jobs = get_instahyre_jobs_from_API(skill,location,experience)
            # instahyre_jobs = await extract_jobs_from_instahyre(page, target_instahyre_url)
        except Exception as e:
            print(f"Error scraping Instahyre: {str(e)}")

        print("Starting naukari")
        try:
            naukari_jobs = await get_jobs_from_naukari(skill,location,experience)
        except Exception as e:
            print(f'Error scraping naukari: {str(e)}')

        # Close browser
        await browser.close()

        # Check if both failed
        if not indeed_jobs and not instahyre_jobs and not naukari_jobs:
            raise Exception("Scraping failed for all sources.")

        return {"indeed":indeed_jobs,"instahyre": instahyre_jobs,"naukari":naukari_jobs}
