import os
import asyncio
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from google import genai as genai_new
from google.genai import types as genai_types

# Default budget for short calls (diagnostic questions, level inference, adaptive chat).
# Roadmap generation needs far more room and passes its own max_tokens explicitly.
DEFAULT_MAX_TOKENS = 1500

MODEL_CHAINS = {
    "development": ["gemini-3.1-flash-lite", "gemma-4-31b-it"],
    "production": ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"],
}


async def gemini_call(
    prompt: str,
    json_mode: bool = False,
    attempt: int = 0,
    max_tokens: int = DEFAULT_MAX_TOKENS,
) -> str:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
    models = MODEL_CHAINS[ENVIRONMENT]
    if attempt >= len(models):
        raise RuntimeError("All Gemini models exhausted")

    try:
        model = genai.GenerativeModel(models[attempt])
        config = GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.4,
            response_mime_type="application/json" if json_mode else "text/plain",
        )
        response = await asyncio.to_thread(model.generate_content, prompt, generation_config=config)
        return response.text
    except Exception as e:
        if ("429" in str(e) or "quota" in str(e).lower()) and attempt < len(models) - 1:
            await asyncio.sleep(2 ** attempt)
            return await gemini_call(prompt, json_mode, attempt + 1, max_tokens=max_tokens)
        raise

async def gemini_call_with_search(prompt: str, max_tokens: int = 4096) -> str:
    """
    Like gemini_call, but uses the new google.genai SDK with Google Search
    grounding enabled. Used ONLY for roadmap generation, where we want Gemini
    to supplement our scraped roadmap.sh context with live web sources.
    Returns the raw text response (caller is responsible for JSON parsing).
    """
    client = genai_new.Client(api_key=os.environ["GEMINI_API_KEY"])
    
    config = genai_types.GenerateContentConfig(
        max_output_tokens=max_tokens,
        temperature=0.4,
        tools=[{"google_search": {}}],
    )
    
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=prompt,
        config=config,
    )
    return response.text