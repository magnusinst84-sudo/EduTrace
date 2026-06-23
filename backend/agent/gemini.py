import os
import asyncio
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from google import genai as genai_new
from google.genai import types as genai_types
import logging

logger = logging.getLogger(__name__)

DEFAULT_MAX_TOKENS = 1500

MODEL_CHAINS = {
    "development": ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.1-flash-lite"],
    "production":  ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.1-flash-lite"],
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
    client = genai_new.Client(api_key=os.environ["GEMINI_API_KEY"])

    config = genai_types.GenerateContentConfig(
        max_output_tokens=max_tokens,
        temperature=0.4,
        tools=[{"google_search": {}}],
    )

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-3.5-flash",
        contents=prompt,
        config=config,
    )

    if response.text is None:
        logger.warning("gemini_call_with_search: response.text is None, falling back to no-search")
        fallback_config = genai_types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            temperature=0.4,
        )
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3.5-flash",
            contents=prompt,
            config=fallback_config,
        )

    if response.text is None:
        fallback_config = genai_types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            temperature=0.4,
        )
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=fallback_config,
        )

    return response.text