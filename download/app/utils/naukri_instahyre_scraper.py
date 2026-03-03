from fastapi import HTTPException
from bs4 import BeautifulSoup
import random
import requests
from urllib.parse import urlencode

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

async def naukri_instahyre_job_scraper(skill: str, location: str, experience: int):
    # target_linkedin_url = f"https://www.linkedin.com/jobs/{urllib.parse.quote(skill)}-jobs-{urllib.parse.quote(location)}"
    target_instahyre_url = "https://www.instahyre.com/search-jobs/"
    print(f"Skill: {skill}, Location: {location}, Experience: {experience}")

    
    # Initialize job listscontext
    instahyre_jobs, naukari_jobs = [], []

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

    # Check if both failed
    if not instahyre_jobs and not naukari_jobs:
        raise Exception("Scraping failed for all sources.")

    return {"instahyre": instahyre_jobs,"naukari":naukari_jobs}
