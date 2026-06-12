import os
import asyncio
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

MAX_TOKENS = 1500

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

MODEL_CHAINS = {
    "development": ["gemini-3.1-flash-lite", "gemma-4-31b-it"],
    "production": ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"],
}

async def gemini_call(prompt: str, json_mode: bool = False, attempt: int = 0) -> str:
    models = MODEL_CHAINS[ENVIRONMENT]
    if attempt >= len(models):
        raise RuntimeError("All Gemini models exhausted")

    try:
        model = genai.GenerativeModel(models[attempt])
        config = GenerationConfig(
            max_output_tokens=MAX_TOKENS,
            temperature=0.4,
            response_mime_type="application/json" if json_mode else "text/plain",
        )
        response = await asyncio.to_thread(model.generate_content, prompt, generation_config=config)
        return response.text
    except Exception as e:
        if ("429" in str(e) or "quota" in str(e).lower()) and attempt < len(models) - 1:
            await asyncio.sleep(2 ** attempt)
            return await gemini_call(prompt, json_mode, attempt + 1)
        raise