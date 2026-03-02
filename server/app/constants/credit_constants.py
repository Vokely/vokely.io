RESUME_DEDUCTION_AMOUNT = 20
INTERVIEW_DEDUCTION_AMOUNT = 50
NEW_USER_CREDIT_AMOUNT = 100
USER_LIMIT = 5000

ROADMAP_DEDUCTION_AMOUNT = 30

EXCHANGE_CODES_CACHE_KEY="exchange_codes"
COUNTRY_PRICING_TIERS = {
    # Tier 1: 80% off
    "tier1": {
        "countries" : ['IN', 'PK', 'BD', 'LK', 'NP', 'AF', 'MM', 'KH', 'LA', 'NG'],
        "discount" : 80,
        "tier" : 1
    },

    #Tier 2: 30% off
    "tier2":{
        "countries" : ['BR', 'MX', 'AR', 'CO', 'PE', 'TH', 'PH', 'VN', 'ID', 'MY', 'TR', 'PL', 'ZA', 'EG', 'KE'],
        "discount" : 30,
        "tier" : 2
    }, 

    #Tier 3: 0% off
    "tier3":{
        "countries" :['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'CH', 'DK', 'FI', 'IT', 'ES', 'JP', 'KR', 'SG', 'HK'],
        "discount" : 0,
        "tier" : 3
    }, 
}