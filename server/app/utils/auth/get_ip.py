from fastapi import Request
import httpx
import os
from dotenv import load_dotenv
from utils.logger import logger
from countryinfo import CountryInfo
from currency_symbols import CurrencySymbols

load_dotenv()

GEO_API_PROVIDERS = [
    {
        "link": "https://api.ipgeolocation.io/ipgeo?apiKey=" + os.getenv("IPGEOLOCATION_API_KEY") + "&ip={ip}",
    },
    {
        "link": "https://ipapi.co/{ip}/json",
    },
    {
        "link": "https://api.ip2location.io/?key=" + os.getenv("IP2LOCATION_API_KEY") + "&ip={ip}",
    },
]

def get_currency_code_and_symbol(country_code: str):
    try:
        country = CountryInfo(country_code)
        currency_code = country.info().get("currencies", [None])[0]
        currency_symbol = CurrencySymbols.get_symbol(currency_code)
        return currency_code, currency_symbol
    except Exception as e:
        print(f"Failed to get currency info for {country_code}: {e}")
        return "USD", "$"  

def get_real_ip(request: Request) -> str:
    cloudflare_ip = request.headers.get("CF-Connecting-IP")
    logger.debug(f"cloudflare_ip : {cloudflare_ip}")

    x_forwarded_for = request.headers.get("X-Forwarded-For")
    logger.debug(f"x_forwarded_for : {x_forwarded_for}")

    if cloudflare_ip:
        ip = cloudflare_ip
    elif x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host  

    logger.debug(f"resolved_client_ip : {ip}")
    return ip


def normalize_geo_data(data: dict, provider_url: str) -> dict | None:
    try:
        if "ipgeolocation.io" in provider_url:
            return {
                "country_code": data.get("country_code2"),
                "country_name": data.get("country_name"),
                "currency_code": data.get("currency", {}).get("code"),
                "currency_symbol": data.get("currency", {}).get("symbol")
            }
        elif "ipapi.co" in provider_url:
            country_code = data.get("country_code") or data.get("country")
            currency_code, currency_symbol = get_currency_code_and_symbol(country_code)
            return {
                "country_code": data.get("country_code") or data.get("country"),
                "country_name": data.get("country_name"),
                "currency_code": data.get("currency"),
                "currency_symbol": currency_symbol
            }
        elif "ip2location.io" in provider_url:
            # This one does not provide currency, so fallback manually
            currency_code, currency_symbol = get_currency_code_and_symbol(data.get("country_code"))
            return {
                "country_code": data.get("country_code"),
                "currency_code": currency_code,
                "country_name": data.get("country_name"),
                "currency_symbol": currency_symbol
            }
    except Exception as e:
        logger.error(f"Failed to normalize geo data: {e}")
        return None


async def get_geo_location(ip: str):
    async with httpx.AsyncClient() as client:
        for provider in GEO_API_PROVIDERS:
            try:
                url = provider["link"].replace("{ip}", ip)

                res = await client.get(url, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    unified = normalize_geo_data(data, provider["link"])
                    if unified:
                        return unified
            except Exception as e:
                logger.warning(f"Geo provider failed: {provider['link']} | Error: {e}")
                continue  
    return None
