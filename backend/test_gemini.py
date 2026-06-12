from dotenv import load_dotenv
load_dotenv()
import asyncio
from agent.gemini import gemini_call

async def main():
    result = await gemini_call("Say hello in one sentence.")
    print(result)

asyncio.run(main())