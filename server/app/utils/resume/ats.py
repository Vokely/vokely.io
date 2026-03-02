import re
from collections import Counter
from typing import List
from collections import Counter
from typing import Dict,List, Any

import spacy

from models.ats import ATSBasicAnalysis, ATSSection, ResumeEssentials, ProfileContact, MandatorySections, Hyperlink, CheckMandatorySection, ATSScoring, ATSScoreBreakdown, SectionScore

# Load NLP
nlp = spacy.load("en_core_web_sm")

def analyze_passive_voice(doc) -> List[str]:
    """Detect passive voice sentences."""
    issues = []
    for sent in doc.sents:
        for token in sent:
            if token.dep_ == "auxpass":
                issues.append(sent.text.strip())
                break
    return issues


def analyze_tense_inconsistency(doc) -> List[ATSSection]:
    """
    Detect sentences mixing past and present tense.
    Return detailed info as ATSSection entries with recommendations.
    """
    issues = []
    for sent in doc.sents:
        tenses = set()
        past_verbs = []
        present_verbs = []

        for token in sent:
            if token.tag_ in ("VBD", "VBN"):
                tenses.add("past")
                past_verbs.append(token.text)
            elif token.tag_ in ("VBZ", "VBP", "VBG"):
                tenses.add("present")
                present_verbs.append(token.text)

        if len(tenses) > 1:
            # Build issue text
            recommendation = "Sentence mixes tenses:"
            if past_verbs:
                recommendation += f"past ({', '.join(past_verbs)})"
            if present_verbs:
                recommendation += f" present ({', '.join(present_verbs)})"
            issue_text = " ".join(recommendation)

            # Append as ATSSection
            issues.append(
                ATSSection(
                    issue=sent.text.strip(),
                    recommendation=recommendation,
                    solution=""
                )
            )

    return issues


def analyze_repetitive_phrases(text: str, threshold=3, min_length=4, top_n=4) -> List[str]:
    """
    Detect repeated words above threshold, only including words longer than min_length.
    Returns top_n results in descending order of repetition count.
    """
    words = re.findall(r"\b\w+\b", text.lower())
    counts = Counter(words)

    # Filter first, then sort by descending frequency
    filtered = [
        (word, count)
        for word, count in counts.items()
        if count >= threshold and len(word) > min_length
    ]

    sorted_filtered = sorted(filtered, key=lambda x: x[1], reverse=True)

    # Return only top_n results
    return [
        f"'{word}' repeated {count} times"
        for word, count in sorted_filtered[:top_n]
    ]

def analyze_sentence_clarity(doc, max_length=30) -> List[str]:
    """Flag very long sentences."""
    return [sent.text.strip() for sent in doc.sents if len(sent.text.split()) > max_length]


def analyze_basic_sections(full_text: str) -> ATSBasicAnalysis:
    doc = nlp(full_text)

    passive_issues = analyze_passive_voice(doc)
    repetitive_issues = analyze_repetitive_phrases(full_text)
    clarity_issues = analyze_sentence_clarity(doc)
    formatting_issues = [] 
    bullet_issues = [] 
    first_person_issues = []

    # First-person pronouns
    first_person_pronouns = {"i", "me", "my", "mine"}
    for sent in doc.sents:
        if any(tok.text.lower() in first_person_pronouns for tok in sent):
            first_person_issues.append(sent.text.strip())

    def wrap_issues(issue_list: List[str], recommendation: str) -> List[ATSSection]:
        return [
            ATSSection(issue=issue, recommendation=recommendation,solution="")
            for issue in issue_list
        ]

    return ATSBasicAnalysis(
        active_voice=wrap_issues(
            passive_issues, "Rewrite passive sentences in active voice."
        ),
        bullet_points_style=wrap_issues(
            bullet_issues, "Keep the bullet points short and concise."
        ),
        repetitive_words=wrap_issues(
            repetitive_issues, "Replace repeated words with synonyms."
        ),
        sentence_clarity=wrap_issues(
            clarity_issues, "Split long sentences for clarity."
        ),
        formatting_uniformity=wrap_issues(
            formatting_issues, "Ensure consistent font size, spacing, and alignment."
        ),
        first_person_pronouns=wrap_issues(
            first_person_issues,
            "Remove first-person pronouns in professional resumes.",
        ),
    )

def append_with_period(target_list, text):
    """
    Append text to target_list, ensuring it ends with a period.
    """
    text = text.strip()
    if not text.endswith("."):
        text += "."
    target_list.append(text)


def build_resume_text(resume_json: dict) -> str:
    parts = []

    pinfo = resume_json.get("personalInfo", {})
    if pinfo.get("summary"):
        parts.append(pinfo["summary"])

    experience = resume_json.get("experience", [])
    for exp in experience:
        desc = exp.get("description", [])
        if isinstance(desc, list):
            parts.extend(desc)
        elif isinstance(desc, str):
            append_with_period(parts, ach)

    achievements = resume_json.get("achievements", [])
    for ach in achievements:
        append_with_period(parts, ach)

    projects = resume_json.get("projects", [])
    for proj in projects:
        desc = proj.get("description", [])
        if isinstance(desc, list):
            parts.extend(desc)
        elif isinstance(desc, str):
            append_with_period(parts, ach)

    docs = " ".join(parts)
    return docs


def get_basic_analysis(resume_details):
    full_text = build_resume_text(resume_details)
    basic_analysis = analyze_basic_sections(full_text)
    return basic_analysis

def merge_gpt_solutions(basic_analysis: ATSBasicAnalysis, gpt_recommendations: Dict) -> ATSBasicAnalysis:
    """
    Merges GPT-generated solutions into the ATSBasicAnalysis model,
    ensuring the return structure is in ATSSection format for each category.
    """

    merged_data = {}

    # Convert gpt_recommendations to map by ID for quick lookup
    for category_name, section_list in basic_analysis.model_dump().items():
        gpt_items = gpt_recommendations.get(category_name, [])
        gpt_map = {entry.get("id"): entry.get("solution") for entry in gpt_items}

        updated_sections = []
        for item in section_list:
            solution = gpt_map.get(item["id"], "")
            # Ensure every item still keeps ATSSection structure
            updated_section = ATSSection(
                id=item["id"],
                issue=item["issue"],
                recommendation=item["recommendation"],
                solution=solution or "" 
            )
            updated_sections.append(updated_section)

        merged_data[category_name] = updated_sections

    return ATSBasicAnalysis(**merged_data)

# ------------------------------------------------RESUME ESSENTIALS-----------------------------------------\
from urllib.parse import urlparse
import validators

def check_resume_essentials(resume_data: Dict[str, Any]) -> ResumeEssentials:
    """
    Checks if the resume contains all essential elements required for ATS systems.
    
    Args:
        resume_data: Dictionary containing the extracted resume data
        
    Returns:
        ResumeEssentials: Structured analysis of resume essentials
    """
    
    # Check Profile Contact Information
    profile_contact = _check_profile_contact(resume_data)
    
    # Check Mandatory Sections
    mandatory_sections = _check_mandatory_sections(resume_data)
    
    # Check and Validate Hyperlinks
    hyperlinks = _check_hyperlinks(resume_data)
    
    return ResumeEssentials(
        profile_contact=profile_contact,
        mandatory_sections=mandatory_sections,
        hyperlinks=hyperlinks
    )


def _check_profile_contact(resume_data: Dict[str, Any]) -> ProfileContact:
    """Check if essential contact information is present."""
    personal_info = resume_data.get("personalInfo", {})
    
    # Check for name (first name or last name)
    has_name = bool(
        personal_info.get("firstName", "").strip() or 
        personal_info.get("lastName", "").strip()
    )
    
    # Check for email with basic validation
    email = personal_info.get("email", "").strip()
    has_email = bool(email and _is_valid_email(email))
    
    # Check for phone number
    phone = personal_info.get("phone", "").strip()
    has_phone = bool(phone and len(phone) >= 10)  # Basic length check
    
    # Generate notes for missing information
    missing_items = []
    if not has_name:
        missing_items.append("name")
    if not has_email:
        missing_items.append("valid email")
    if not has_phone:
        missing_items.append("phone number")
    
    notes = f"Missing: {', '.join(missing_items)}" if missing_items else "All contact information present"
    
    return ProfileContact(
        has_name=has_name,
        has_email=has_email,
        has_phone=has_phone,
        notes=notes
    )


def _check_mandatory_sections(resume_data: Dict[str, Any]) -> MandatorySections:
    """Check if all mandatory resume sections are present and populated."""
    
    # Check Summary/Objective
    summary = resume_data.get("personalInfo", {}).get("summary", "").strip()
    has_summary = bool(summary and len(summary) > 20)  # At least 20 characters
    summary_notes = None if has_summary else (
        "No summary found" if not summary else 
        "Summary too short (less than 20 characters)"
    )
    
    # Check Education
    education = resume_data.get("education", [])
    valid_education = [
        edu for edu in education 
        if edu.get("degree", "").strip() and edu.get("school", "").strip()
    ]
    has_education = bool(valid_education)
    education_notes = None if has_education else (
        "No education section found" if not education else
        "Education entries missing degree or school information"
    )
    
    # Check Skills
    skills = resume_data.get("skills", {})
    technical_skills = skills.get("technical_skills", [])
    soft_skills = skills.get("soft_skills", [])
    has_skills = bool(
        (technical_skills and len(technical_skills) > 0) or 
        (soft_skills and len(soft_skills) > 0)
    )
    skills_notes = None if has_skills else "No technical or soft skills listed"
    
    # Check Experience
    experience = resume_data.get("experience", [])
    valid_experience = [
        exp for exp in experience
        if (exp.get("title", "").strip() and 
            exp.get("company", "").strip() and 
            exp.get("description", []))
    ]
    has_experience = bool(valid_experience)
    experience_notes = None if has_experience else (
        "No work experience found" if not experience else
        "Experience entries missing title, company, or description"
    )
    
    # Check Projects
    projects = resume_data.get("projects", [])
    valid_projects = [
        proj for proj in projects
        if proj.get("name", "").strip() and proj.get("description", [])
    ]
    has_projects = bool(valid_projects)
    projects_notes = None if has_projects else (
        "No projects found" if not projects else
        "Project entries missing name or description"
    )
    
    # Check Achievements/Certifications
    achievements = resume_data.get("achievements", [])
    certifications = resume_data.get("certifications", [])
    has_achievements = bool(
        (achievements and len(achievements) > 0) or 
        (certifications and len(certifications) > 0)
    )
    achievements_notes = None if has_achievements else "No achievements or certifications found"
    
    return MandatorySections(
        summary=CheckMandatorySection(has_section=has_summary, notes=summary_notes),
        education=CheckMandatorySection(has_section=has_education, notes=education_notes),
        skills=CheckMandatorySection(has_section=has_skills, notes=skills_notes),
        experience=CheckMandatorySection(has_section=has_experience, notes=experience_notes),
        projects=CheckMandatorySection(has_section=has_projects, notes=projects_notes),
        achievements=CheckMandatorySection(has_section=has_achievements, notes=achievements_notes)
    )


def _check_hyperlinks(resume_data: Dict[str, Any]) -> List[Hyperlink]:
    """Check and validate all hyperlinks in the resume."""
    hyperlinks = []
    
    # Check social links
    social_links = resume_data.get("socialLinks", [])
    for link in social_links:
        url = link.get("url", "").strip()
        platform = link.get("platform", "").strip()
        label = link.get("label", "").strip()
        
        if url:  # Only process if URL exists
            name = platform or label or "Unknown Link"
            is_valid = _validate_url(url)
            is_clickable = _check_if_clickable(url)
            
            hyperlinks.append(Hyperlink(
                name=name,
                is_valid=is_valid,
                is_clickable=is_clickable
            ))
    
    # Check project links
    projects = resume_data.get("projects", [])
    for project in projects:
        link = project.get("link", "").strip()
        if link:
            name = f"{project.get('name', 'Project')} Link"
            is_valid = _validate_url(link)
            is_clickable = _check_if_clickable(link)
            
            hyperlinks.append(Hyperlink(
                name=name,
                is_valid=is_valid,
                is_clickable=is_clickable
            ))
    
    # Scan for URLs in text content (descriptions, summaries, etc.)
    text_urls = _extract_urls_from_text(resume_data)
    for url_info in text_urls:
        hyperlinks.append(url_info)
    
    return hyperlinks


def _is_valid_email(email: str) -> bool:
    """Validate email format."""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def _validate_url(url: str) -> str:
    """Validate URL format and accessibility."""
    if not url:
        return "Invalid: Empty URL"
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Basic URL validation
    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            return "Invalid: No domain found"
        
        # Use validators library if available
        if validators.url(url):
            return "Valid"
        else:
            return "Invalid: Malformed URL"
            
    except Exception:
        return "Invalid: Cannot parse URL"


def _check_if_clickable(url: str) -> bool:
    """Check if URL is properly formatted as a clickable link."""
    return url.startswith(('http://', 'https://'))


def _extract_urls_from_text(resume_data: Dict[str, Any]) -> List[Hyperlink]:
    """Extract URLs from text content in the resume."""
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    hyperlinks = []
    
    def scan_text(text: str, context: str) -> None:
        if isinstance(text, str):
            urls = re.findall(url_pattern, text)
            for url in urls:
                hyperlinks.append(Hyperlink(
                    name=f"URL in {context}",
                    is_valid=_validate_url(url),
                    is_clickable=True
                ))
    
    # Scan various text fields
    personal_info = resume_data.get("personalInfo", {})
    scan_text(personal_info.get("summary", ""), "Summary")
    
    # Scan experience descriptions
    for i, exp in enumerate(resume_data.get("experience", [])):
        for desc in exp.get("description", []):
            scan_text(desc, f"Experience {i+1}")
    
    # Scan project descriptions
    for i, proj in enumerate(resume_data.get("projects", [])):
        for desc in proj.get("description", []):
            scan_text(desc, f"Project {i+1}")
    
    return hyperlinks

# ---------------------------------------------------------SCORE CALCULATION---------------------------------------------

def calculate_ats_scores(analysis_data: Dict[str, Any], has_jd_analysis: bool = False) -> ATSScoring:
    calculate_ats_scores(analysis_data, has_jd_analysis,old_scores=None)

def calculate_ats_scores(analysis_data: Dict[str, Any], has_jd_analysis: bool = False, old_scores:ATSScoring=None) -> ATSScoring:
    """
    Calculate ATS scores based on the analysis data
    
    Args:
        analysis_data: Dictionary containing basic_analysis and resume_essentials
        has_jd_analysis: Boolean indicating if JD analysis is present
    
    Returns:
        ATSScoring: Complete scoring breakdown with total score
    """
    # Define weights based on whether JD analysis is present
    if has_jd_analysis:
        resume_essentials_weight = 30.0
        basic_analysis_weight = 30.0
        jd_analysis_weight = 40.0
    else:
        resume_essentials_weight = 50.0
        basic_analysis_weight = 50.0
        jd_analysis_weight = 0.0
    
    # Calculate Resume Essentials Score
    if old_scores is None:
        resume_essentials_score = calculate_resume_essentials_score(analysis_data.get("resume_essentials", {}))
    
        # Calculate Basic Analysis Score
        basic_analysis_score = calculate_basic_analysis_score(analysis_data.get("basic_analysis", {}))
    else:
        resume_essentials_score = old_scores.breakdown.resume_essentials.score
        basic_analysis_score = old_scores.breakdown.basic_analysis.score

    # Calculate JD Analysis Score (if present)
    jd_analysis_score = 0.0
    if has_jd_analysis:
        jd_analysis_score = old_scores.breakdown.jd_analysis.score
    
    # Calculate weighted total score
    total_score = (
        (resume_essentials_score * resume_essentials_weight / 100) +
        (basic_analysis_score * basic_analysis_weight / 100) +
        (jd_analysis_score * jd_analysis_weight / 100 if has_jd_analysis else 0)
    )
    
    # Create score breakdown
    breakdown = ATSScoreBreakdown(
        resume_essentials=SectionScore(
            score=resume_essentials_score,
            weight=resume_essentials_weight
        ),
        basic_analysis=SectionScore(
            score=basic_analysis_score,
            weight=basic_analysis_weight
        ),
        jd_analysis=SectionScore(
            score=jd_analysis_score,
            weight=jd_analysis_weight
        ) if has_jd_analysis else None
    )
    
    return ATSScoring(
        total_score=round(total_score, 2),
        breakdown=breakdown
    )


def calculate_resume_essentials_score(resume_essentials: Dict[str, Any]) -> float:
    """
    Calculate score for resume essentials section
    
    Args:
        resume_essentials: Dictionary containing profile_contact, mandatory_sections, hyperlinks
    
    Returns:
        float: Score between 0 and 100
    """
    total_score = 0.0
    max_score = 0.0
    
    # Profile Contact scoring (30% of resume essentials)
    profile_contact = resume_essentials.get("profile_contact", {})
    contact_score = 0.0
    contact_max = 30.0
    
    if profile_contact.get("has_name", False):
        contact_score += 10.0
    if profile_contact.get("has_email", False):
        contact_score += 10.0
    if profile_contact.get("has_phone", False):
        contact_score += 10.0
    
    total_score += contact_score
    max_score += contact_max
    
    # Mandatory Sections scoring (60% of resume essentials)
    mandatory_sections = resume_essentials.get("mandatory_sections", {})
    sections_score = 0.0
    sections_max = 60.0
    
    # Each section worth 10 points
    section_names = ["summary", "education", "skills", "experience", "projects", "achievements"]
    for section_name in section_names:
        section = mandatory_sections.get(section_name, {})
        if section.get("has_section", False):
            sections_score += 10.0
    
    total_score += sections_score
    max_score += sections_max
    
    # Hyperlinks scoring (10% of resume essentials)
    hyperlinks = resume_essentials.get("hyperlinks", [])
    hyperlinks_score = 0.0
    hyperlinks_max = 10.0
    
    valid_hyperlinks = sum(1 for link in hyperlinks if link.get("is_valid") == "Valid")
    if valid_hyperlinks > 0:
        hyperlinks_score = min(hyperlinks_max, valid_hyperlinks * 3.33)  # Each valid link worth ~3.33 points
    
    total_score += hyperlinks_score
    max_score += hyperlinks_max
    
    # Calculate percentage score
    if max_score > 0:
        return round((total_score / max_score) * 100, 2)
    return 0.0


def calculate_basic_analysis_score(basic_analysis: Dict[str, Any]) -> float:
    """
    Calculate score for basic analysis section based on issues found
    
    Args:
        basic_analysis: Dictionary containing various analysis categories
    
    Returns:
        float: Score between 0 and 100
    """
    # Define penalty weights for each category
    category_penalties = {
        "active_voice": 2.0,          # 2 points per issue
        "tense_consistency": 3.0,     # 3 points per issue
        "repetitive_words": 1.5,      # 1.5 points per issue
        "sentence_clarity": 4.0,      # 4 points per issue
        "first_person_pronouns": 3.0, # 3 points per issue
        "bullet_points_style": 2.0,   # 2 points per issue
        "formatting_uniformity": 2.0  # 2 points per issue
    }
    
    total_penalty = 0.0
    
    # Calculate penalties for each category
    for category, penalty_per_issue in category_penalties.items():
        issues = basic_analysis.get(category, [])
        if isinstance(issues, list):
            total_penalty += len(issues) * penalty_per_issue
    
    # Start with perfect score and subtract penalties
    base_score = 100.0
    final_score = max(0.0, base_score - total_penalty)
    
    return round(final_score, 2)


# Helper function to integrate with your existing router
def add_scoring_to_analysis(complete_analysis: Dict[str, Any], has_jd_analysis: bool = False) -> ATSScoring:
    """
    Add scoring to the complete analysis response
    
    Args:
        complete_analysis: Dictionary containing the analysis results
        has_jd_analysis: Boolean indicating if JD analysis is present
    
    Returns:
        Dict: Analysis with added scoring section
    """
    return calculate_ats_scores(complete_analysis, has_jd_analysis)
