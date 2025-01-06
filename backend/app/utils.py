import os

import instructor
from fastapi import HTTPException
from instructor.exceptions import InstructorRetryException
from instructor.utils import disable_pydantic_error_url
from litellm import RateLimitError, acompletion
from litellm.exceptions import LITELLM_EXCEPTION_TYPES
from pydantic import ValidationError
from tenacity import (
    AsyncRetrying,
    RetryError,
    retry_if_exception_type,
    stop_after_attempt,
)

from .models import T_Model

disable_pydantic_error_url()
aclient = instructor.from_litellm(acompletion, mode=instructor.Mode.MD_JSON)

PRESET_MODEL_NAME = os.getenv("PRESET_MODEL_NAME", "")
PRESET_TOKEN = os.getenv("PRESET_TOKEN", "")


async def get_parsed_data(
    messages: list,
    schema: type[T_Model],
    model: str,
    api_key: str,
    temperature: float | None = None,
    max_tokens: int | None = None,
    max_attempts: int = 3,
) -> T_Model:
    if model == PRESET_MODEL_NAME and api_key == PRESET_TOKEN:
        api_key = os.getenv("LITELLM_API_KEY", api_key)
    try:
        return await aclient.chat.completions.create(
            model=model,
            api_key=api_key,
            messages=messages,
            response_model=schema,
            temperature=temperature,
            max_tokens=max_tokens,
            max_retries=AsyncRetrying(
                stop=stop_after_attempt(max_attempts),
                retry=retry_if_exception_type((ValidationError, RateLimitError)),
            ),
        )
    except tuple(LITELLM_EXCEPTION_TYPES) as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except TypeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except (InstructorRetryException, RetryError) as e:
        root_cause = e
        while root_cause.__cause__ is not None:
            root_cause = root_cause.__cause__

        raise HTTPException(
            status_code=500,
            detail=(
                {
                    "error": str(root_cause),
                    "last_completion": e.last_completion
                    and e.last_completion.model_dump(),
                    "n_attempts": e.n_attempts,
                    "messages": e.messages,
                    "total_usage": e.total_usage.model_dump(),
                }
                if isinstance(e, InstructorRetryException)
                else str(root_cause)
            ),
        )
