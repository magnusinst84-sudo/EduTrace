# pyrefly: ignore [missing-import]
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def _key_func(request: Request) -> str:
    """Use authenticated UID if available, otherwise fall back to IP."""
    uid = getattr(request.state, "uid", None)
    if uid:
        return uid
    return get_remote_address(request)


limiter = Limiter(key_func=_key_func)
