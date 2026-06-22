import os
import asyncio
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from google import genai as genai_new
from google.genai import types as genai_types

DEFAULT_MAX_TOKENS = 1500

MODEL_CHAINS = {
    "development": ["gemini-2.5-flash-lite", "gemini-2.5-flash"],
    "production": ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"],
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
    Falls back to no-search call if response.text is None (quota/grounding issue).
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

    # Search grounding can return None text — fall back to non-search call
    if response.text is None:
        logger_msg = "gemini_call_with_search: response.text is None, falling back to no-search"
        import logging
        logging.getLogger(__name__).warning(logger_msg)

        fallback_config = genai_types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            temperature=0.4,
        )
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt,
            config=fallback_config,
        )

    # If still None after fallback, try gemini-2.5-flash-lite
    if response.text is None:
        fallback_config = genai_types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            temperature=0.4,
        )
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=fallback_config,
        )

    return response.text