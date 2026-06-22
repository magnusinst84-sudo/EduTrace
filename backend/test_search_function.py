import asyncio
from dotenv import load_dotenv

load_dotenv()

from agent.gemini import gemini_call_with_search

async def test_search():
    try:
        print("Calling gemini_call_with_search...")
        result = await gemini_call_with_search("say hello in one word", max_tokens=100)
        print("--- RESULT ---")
        print(result)
        print("--------------")
    except Exception as e:
        import traceback
        print("--- ERROR ---")
        traceback.print_exc()
        print("-------------")

if __name__ == "__main__":
    asyncio.run(test_search())
