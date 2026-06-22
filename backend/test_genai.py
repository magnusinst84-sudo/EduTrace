import os
import asyncio
from google import genai as genai_new
from google.genai import types as genai_types
from dotenv import load_dotenv

load_dotenv()

async def test_search():
    client = genai_new.Client(api_key=os.environ["GEMINI_API_KEY"])
    
    config = genai_types.GenerateContentConfig(
        max_output_tokens=100,
        temperature=0.4,
        tools=[{"google_search": {}}], # According to google-genai documentation, tools can be passed directly as dicts if there's confusion about types, or we can test `genai_types.Tool(google_search=genai_types.GoogleSearch())`
    )
    
    print("Testing search grounding with plain text output...")
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents="What is the latest news regarding SpaceX today?",
        config=config,
    )
    print("Response:")
    print(response.text)

if __name__ == "__main__":
    asyncio.run(test_search())
