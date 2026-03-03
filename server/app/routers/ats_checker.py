from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from typing import Dict,Any
#crud
from crud.user import get_user_details_from_header
from crud.resumes import create_resume, update_resume_details
from crud.ats import ATSCRUD
#models
from models.resume import ModuleName, UpdateResume
from models.ats import ATSAnalysisResponse, ATSAnalysisInDB, ATSScoring
#utils
from utils.resume_scraper import construct_resume_details
from utils.resume.ats import get_basic_analysis, merge_gpt_solutions, check_resume_essentials, add_scoring_to_analysis, calculate_ats_scores
from utils.gpt import get_ats_recommendations, gpt_ats_checker
from utils.logger import logger

# db
from db.config import get_database

router = APIRouter()

async def get_ATS_crud():
    db = await get_database()
    return ATSCRUD(db)

ai_jd_response = {
  "score": 75.00,
  "hard_skills_match": {
    "matched": [
      "ReactJS",
      "NodeJS",
      "MongoDB",
      "JavaScript",
      "HTML",
      "CSS",
      "Bootstrap"
    ],
    "partial_match": [
      "MySQL"
    ],
    "missing": [
      "REST API",
      "GraphQL",
      "CI CD",
      "Docker",
      "Postman",
      "Jmeter"
    ]
  },
  "soft_skills_match": {
    "matched": [],
    "partial_match": [],
    "missing": [
      "problem-solving",
      "attention to detail",
      "collaboration",
      "code review",
      "communication"
    ]
  },
  "keyword_density": [
    {
      "keyword": "ReactJS",
      "frequency": 3,
      "importance": "high",
      "contextual_sections": [
        "Experience",
        "Projects"
      ]
    },
    {
      "keyword": "NodeJS",
      "frequency": 3,
      "importance": "high",
      "contextual_sections": [
        "Experience",
        "Projects"
      ]
    },
    {
      "keyword": "MongoDB",
      "frequency": 3,
      "importance": "high",
      "contextual_sections": [
        "Experience",
        "Projects"
      ]
    },
    {
      "keyword": "JavaScript",
      "frequency": 2,
      "importance": "high",
      "contextual_sections": [
        "Skills",
        "Experience"
      ]
    },
    {
      "keyword": "HTML",
      "frequency": 1,
      "importance": "medium",
      "contextual_sections": [
        "Skills"
      ]
    },
    {
      "keyword": "CSS",
      "frequency": 1,
      "importance": "medium",
      "contextual_sections": [
        "Skills"
      ]
    },
    {
      "keyword": "Bootstrap",
      "frequency": 2,
      "importance": "medium",
      "contextual_sections": [
        "Skills",
        "Projects"
      ]
    },
    {
      "keyword": "MySQL",
      "frequency": 1,
      "importance": "medium",
      "contextual_sections": [
        "Skills"
      ]
    }
  ],
  "achievement_statements": [
    {
      "section": "Experience",
      "suggestion": "Highlight any measurable impact or results from projects, e.g., 'Improved user engagement by X%' or 'Reduced load time by Y seconds'."
    },
    {
      "section": "Projects",
      "suggestion": "Add metrics or specific outcomes, such as 'Handled Z concurrent users' or 'Achieved X% faster data retrieval'."
    }
  ],
  "experience_analysis": {
    "required_experience": "1 Year or Fresher, Intern can also apply",
    "user_experience": "Internship experience with 3 projects involving ReactJS, NodeJS, MongoDB, and JavaScript; total practical exposure approximately 1 year.",
    "gap_analysis": "Candidate has relevant internship experience but lacks extensive professional experience. Exposure to backend technologies like REST API, GraphQL, CI/CD, Docker, and cloud is limited or absent."
  },
  "job_requirements_match": [
    {
      "requirement": "Designing and developing user-friendly and responsive web applications using the MERN stack",
      "matched": True,
      "suggestion": {
        "section": "Experience",
        "suggestion": "Emphasize projects demonstrating responsive design and user-centric features."
      }
    },
    {
      "requirement": "Implementing and integrating various back-end and front-end technologies",
      "matched": True,
      "suggestion": {
        "section": "Projects",
        "suggestion": "Highlight integration of backend and frontend in projects like PinQuest and Chat App."
      }
    },
    {
      "requirement": "Writing clean, maintainable, and efficient code",
      "matched": False,
      "suggestion": {
        "section": "Summary or Experience",
        "suggestion": "Include statements about adherence to coding standards, code reviews, or refactoring practices."
      }
    },
    {
      "requirement": "Debugging and fixing bugs",
      "matched": False,
      "suggestion": {
        "section": "Experience",
        "suggestion": "Add specific examples of debugging or performance optimization in projects."
      }
    },
    {
      "requirement": "Collaborating with cross-functional teams",
      "matched": False,
      "suggestion": {
        "section": "Summary or Experience",
        "suggestion": "Mention teamwork, collaboration, or participation in code reviews."
      }
    },
    {
      "requirement": "Participating in code reviews and providing feedback",
      "matched": False,
      "suggestion": {
        "section": "Summary or Experience",
        "suggestion": "State involvement in peer reviews or mentorship activities."
      }
    },
    {
      "requirement": "Excellent problem-solving skills, attention to detail",
      "matched": False,
      "suggestion": {
        "section": "Summary or Experience",
        "suggestion": "Add examples demonstrating problem-solving or attention to detail in project work."
      }
    }
  ]
}

# resume_details = {
#   "personalInfo": {
#     "firstName": "Arun",
#     "lastName": "Karthik",
#     "email": "ak05032k2@gmail.com",
#     "phone": "+91-9360660780",
#     "location": "",
#     "title": "",
#     "summary": ""
#   },
#   "skills": {
#     "technical_skills": [
#       "C",
#       "C++",
#       "Javascript",
#       "TypeScript",
#       "HTML",
#       "CSS",
#       "GSAP",
#       "Bootstrap",
#       "Shadcn UI",
#       "Material UI",
#       "Redis",
#       "ReactJS",
#       "ThreeJs",
#       "VueJs",
#       "TailwindCss",
#       "NodeJS",
#       "NextJS",
#       "ExpressJS",
#       "NestJs",
#       "REST API",
#       "GraphQL",
#       "MySQL",
#       "MongoDB",
#       "CI CD",
#       "Docker",
#       "Postman",
#       "Jmeter"
#     ],
#     "soft_skills": []
#   },
#   "socialLinks": [
#     {
#       "platform": "Github",
#       "url": "https://github.com/ArunKarthik05",
#       "icon": "",
#       "label": ""
#     },
#     {
#       "platform": "LinkedIn",
#       "url": "https://www.linkedin.com/in/arun-karthik-3b08b5218/",
#       "icon": "",
#       "label": ""
#     },
#     {
#       "platform": "PortFolio",
#       "url": "https://my-portfolio-ak.netlify.app/",
#       "icon": "",
#       "label": ""
#     }
#   ],
#   "experience": [
#     {
#       "title": "Web Development Intern",
#       "company": "Coderscave",
#       "location": "Coimbatore, India",
#       "startDate": "May' 23",
#       "endDate": "June' 23",
#       "description": [
#         "Developed a Portfolio website using GSAP with Scroll Triggers and seamlessly blending animations.",
#         "Built a React Movie Rating Application as a second project providing real-time data of movies using the OMDB API.",
#         "Netﬂix Clone of the home page with ReactJs and Axios delivering an immersive user experience with slick user interface."
#       ]
#     },
#     {
#       "title": "Data Science Intern",
#       "company": "Exposys DataLabs",
#       "location": "Bangalore, India",
#       "startDate": "Jun' 22",
#       "endDate": "July' 22",
#       "description": [
#         "Leveraged Python and Jupyter to create and train machine learning models, utilizing Pandas for data manipulation and implementing diverse ML algorithms to accurately predict company proﬁts.",
#         "Contributed to informed decision-making by providing insights derived from the analysis of company data, enabling stakeholders to strategize based on predicted proﬁt outcomes."
#       ]
#     }
#   ],
#   "education": [
#     {
#       "degree": "MCA",
#       "school": "PSG College of Arts and Science, Coimbatore",
#       "location": "Coimbatore",
#       "startDate": "2019",
#       "endDate": "",
#       "gpa": "8.20/10.00"
#     },
#     {
#       "degree": "B.sc CS",
#       "school": "PSG College of Arts and Science, Coimbatore",
#       "location": "Coimbatore",
#       "startDate": "2017",
#       "endDate": "",
#       "gpa": "7.90/10.00"
#     },
#     {
#       "degree": "Class XII, SSLC",
#       "school": "Sri Ramakrishna Matric Higher Secondary School, Coimbatore",
#       "location": "Coimbatore",
#       "startDate": "",
#       "endDate": "",
#       "gpa": "84%"
#     },
#     {
#       "degree": "Class X, SSLC",
#       "school": "Hilton Matric Higher Secondary School, TN",
#       "location": "TN",
#       "startDate": "",
#       "endDate": "",
#       "gpa": "97%"
#     }
#   ],
#   "projects": [
#     {
#       "name": "PinQuest - A MERN Stack Social Hub with contests",
#       "description": [
#         "Implemented an unique contests feature for user engagement where winners are declared based on the number of likes using nodecron.",
#         "Implemented secure authentication using Passport-local ensuring robust and reliable login system.",
#         "Engineered the backend with Express.js, seamlessly connecting to MongoDB using Mongoose for efﬁcient data storage and retrieval.",
#         "Crafted an intuitive and responsive user interface with EJS on the frontend, providing a visually appealing experience for users."
#       ],
#       "link": ""
#     },
#     {
#       "name": "Handpose Detection",
#       "description": [
#         "Implemented handpose detection using TensorFlow.js to accurately identify and track hand movements in real-time.",
#         "Integrated the model results into a user-friendly interface, providing a seamless and interactive experience for users to visualize and understand hand poses."
#       ],
#       "link": ""
#     },
#     {
#       "name": "Chat App",
#       "description": [
#         "Designed and developed a Fullstack Chatting application (MERN stack) from scratch, enabling users to engage in both one-on-one and group chats with options allowing users to create, join, and manage group conversations, including customization of group settings.",
#         "Utilized a comprehensive technology stack, including NodeJS, ExpressJS, Socket.io, ReactJS, ChakraUI, and MongoDB Atlas.",
#         "Developed a responsive user-centric website and used bcrypt and JWT tokens for adding another layer of security and relaxed experience."
#       ],
#       "link": ""
#     },
#     {
#       "name": "Promptomania - Ready to use prompts",
#       "description": [
#         "Created a user-ready prompts application from scratch, allowing registered users to efﬁciently store, retrieve, update, and delete prompts, enhancing productivity.",
#         "Used Next.js, MUI, and TailwindCss for creating front end of the application including the prompts-feed page.",
#         "Developed the project's backend using Node.js and Express.js, leveraging MongoDB as the database to ensure data storage and retrieval.",
#         "Implemented a layer of security by using NextAuth and GoogleProvider for user authentication."
#       ],
#       "link": ""
#     }
#   ],
#   "certifications": [
#     "NodeJS, Express, MongoDB - The Complete Bootcamp",
#     "The Complete SQL Bootcamp (Udemy)",
#     "The Ultimate React Guide 2023 (Udemy)",
#     "ChatGPT The Complete Prompt Engineering Guide (Udemy)"
#   ],
#   "achievements": [
#     "Clinched the Gold in Nepal Badminton Junior International Series 2020 Boys Doubles",
#     "Maiden International Podium ﬁnish with a Bronze in Bangladesh Junior International Series 2020 Boys Doubles",
#     "Wrapped up my juniors with the career highest rank World No. 190 in Boys Doubles, as per BWF ranking 2020 in Badminton",
#     "Attained the esteemed title of Former India No. 24 in Badminton Boys Doubles",
#     "Secured the prestigious Gold Medal at the CM Trophy State Meet in 2023 in Men’s Doubles U23",
#     "Led my team to the ﬁnals in the Tamil Nadu Badminton Super League"
#   ],
#   "hobbies": [],
#   "languages": [
#     "English",
#     "Tamil"
#   ]
# }

dummy_response = {
    "basic_analysis": {},
    "resume_essentials": {
        "profile_contact": {
            "has_name": True,
            "has_email": False,
            "has_phone": False,
            "notes": "Missing: valid email, phone number"
        },
        "mandatory_sections": {
            "summary": {
                "has_section": False,
                "notes": "No summary found"
            },
            "education": {
                "has_section": True,
                "notes": None
            },
            "skills": {
                "has_section": True,
                "notes": None
            },
            "experience": {
                "has_section": True,
                "notes": None
            },
            "projects": {
                "has_section": False,
                "notes": "No projects found"
            },
            "achievements": {
                "has_section": False,
                "notes": "No achievements or certifications found"
            }
        },
        "hyperlinks": []
    },
    "resume_id": "688134ea91cc6d992922cb6c",
    "scoring": {
        "total_score": 70.0,
        "breakdown": {
            "resume_essentials": {
                "score": 40.0,
                "weight": 50.0
            },
            "basic_analysis": {
                "score": 100.0,
                "weight": 50.0
            },
            "jd_analysis": None
        }
    }
}

@router.post("/")
async def check_resume(request: Request, file:UploadFile = File(...), user_details:Dict[str,Any] = Depends(get_user_details_from_header)):
    try:
        user_details = await get_user_details_from_header(request)
        extracted_resume = await construct_resume_details(request,file,"gpt")
        resume_details = {
            "name":file.filename,
            "data":extracted_resume
        }
        created_resume = await create_resume(user_details.id,resume_details,ModuleName.ATS_CHECKER,False)
        created_resume_data = created_resume.get("resume_data")

        #Get resume essentials analysis
        resume_essentials = check_resume_essentials(created_resume_data)

        #Get Basic analysis
        basic_analysis = get_basic_analysis(created_resume_data)
        gpt_recommendations = await get_ats_recommendations(request,basic_analysis.model_dump())
        basic_analysis_result = merge_gpt_solutions(basic_analysis,gpt_recommendations)

        #Construct JSON
        complete_analysis = {
            "basic_analysis":basic_analysis_result.model_dump(),
            "resume_essentials":resume_essentials.model_dump(),
            "resume_id" : created_resume.get("_id")
        }
        ats_scoring = add_scoring_to_analysis(complete_analysis, has_jd_analysis=False)
        ats_crud =  await get_ATS_crud()

        ats_analysis_response = ATSAnalysisResponse(
            basic_analysis=basic_analysis_result,
            resume_essentials=resume_essentials,
            id=created_resume.get("id"),
            scoring=ats_scoring
        )
        db_response = await ats_crud.create_report(ats_analysis_response,user_details.id,created_resume.get("id"),False)

        return JSONResponse(content=db_response, status_code=200)
    except HTTPException as http_exc:
        print(http_exc)
        raise http_exc
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occured while checking resume details")

@router.post("/analyze-jd")
async def analyze_jd(request:Request, job_details:Dict[str,Any], user_details:Dict[str,Any] = Depends(get_user_details_from_header),ats_crud:ATSCRUD = Depends(get_ATS_crud)):
    try:
        job_description = job_details.get("job_description")
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
        
        report_details = await ats_crud.get_report_by_id(job_details.get("report_id"))
        if not report_details:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if report_details.get("user_id") != user_details.id:
            raise HTTPException(status_code=403, detail="You are not authorized to access this report")
        
        update_data = UpdateResume(job_description=job_description)

        updated_resume = await update_resume_details(update_data,job_details.get("resume_id"),user_details.id)
        jd_analysis = await gpt_ats_checker(request,updated_resume.get("resume_data"),job_description)

        old_scores = report_details.get("scoring")
        jd_analysis_score = jd_analysis.get("score")
        logger.debug(f"JD Analysis Score: {jd_analysis_score}")
        #Remove score from jd_analysis
        if "score" in jd_analysis:
            del jd_analysis["score"]
        old_scores["breakdown"]["jd_analysis"] = {
            "score" : jd_analysis_score,
            "weight": 40.0
        } 

        updated_score = calculate_ats_scores(None,True,ATSScoring.model_validate(old_scores))
        ats_crud =  await get_ATS_crud()
        # Update the report with JD Analysis as True
        updated_report = await ats_crud.update_report(job_details.get("report_id"),{ "jd_tailored": True,"jd_analysis":jd_analysis,"scoring":updated_score.model_dump()},user_details.id)
        
        return JSONResponse(updated_report, status_code=200)
    except HTTPException as http_exc:
        print(http_exc)
        raise http_exc
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occured while analyzing jd for ats")

@router.get("/results/{report_id}",response_model=ATSAnalysisInDB)
async def get_report_detail_by_id(report_id:str, ats_crud:ATSCRUD = Depends(get_ATS_crud)):
    try:
        report = await ats_crud.get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report
    except HTTPException as http_exc:
        print(http_exc)
        raise http_exc
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occured while fetching report details")