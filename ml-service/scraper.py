from serpapi import GoogleSearch
import re


# 🔍 Extract price
import re

def extract_price(text):
    prices = []

    # ₹ per quintal (BEST)
    quintal_matches = re.findall(r'₹\s?(\d{3,5})\s?per quintal', text, re.IGNORECASE)
    prices.extend([int(p) for p in quintal_matches])

    # ₹ per kg → convert to quintal
    kg_matches = re.findall(r'₹\s?(\d{2,3})\s?per kg', text, re.IGNORECASE)
    for p in kg_matches:
        prices.append(int(p) * 100)  # convert kg → quintal

    # fallback: raw ₹ values (but filter strongly)
    raw_matches = re.findall(r'₹\s?(\d{3,5})', text)

    for p in raw_matches:
        val = int(p)

        # 🔥 ONLY accept realistic mandi range
        if 1000 <= val <= 10000:
            prices.append(val)

    return list(set(prices))  # remove duplicates

# 🔥 SERP API FUNCTION
def scrape_news(crop, location):
    try:
        query = f"{crop} mandi price {location}"

        params = {
            "engine": "google",
            "q": query,
            "api_key": "7d80aee14c7891a3b45a9e9905363444786bcc62fb59cc91469dac4874ac9f81"
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        prices = []

        # 🔥 Extract from organic results
        if "organic_results" in results:
            for item in results["organic_results"]:
                snippet = item.get("snippet", "")
                prices.extend(extract_price(snippet))

        # 🔥 Extract from answer box (very important)
        if "answer_box" in results:
            answer = str(results["answer_box"])
            prices.extend(extract_price(answer))

        return {
            "articles": [],
            "prices": prices
        }

    except Exception as e:
        print("SERP ERROR:", str(e))
        return {
            "articles": [],
            "prices": []
        }