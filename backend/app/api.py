from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models import (
    DefineSchemaRequest,
    DefineSchemaResponse,
    ParseDataRequest,
    ParseDataResponse,
)
from utils import get_parsed_data

from metamodel import ModelType, to_python_type

router = APIRouter()
security = HTTPBearer()


@router.post("/define", response_model_exclude_unset=True)
async def define_schema(
    request: DefineSchemaRequest,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> DefineSchemaResponse:
    """Generate a schema from a natural language description.

    This endpoint takes the description of a schema from messages of text/image,
    and generates a structured schema definition following the ModelType format.

    Args:
        request (DefineSchemaRequest): The request body containing messages of
        schema descriptions, schema type and generation parameters.

    Returns:
        DefineSchemaResponse: Including the generated schema based on the
        provided description and token usage.

    Raises:
        HTTPException: If an error occurs during the schema generation process.
    """
    schema = await get_parsed_data(
        messages=request.messages,
        schema=ModelType,
        model=request.model,
        api_key=credentials.credentials,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        max_attempts=request.max_attempts,
    )
    return DefineSchemaResponse(data=schema, usage=schema._raw_response.usage)


@router.post("/parse")
async def parse_data(
    request: ParseDataRequest,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> ParseDataResponse:
    """Generate structured JSON from messages of text/image based on a schema definition.

    Args:
        request (ParseDataRequest): The data parsing request containing the messages,
        schema definition, and model generation parameters.

    Returns:
        ParseDataResponse: The parsed data conforming to the provided schema
        definition and token usage.
    """
    schema = to_python_type(request.definition)
    data = await get_parsed_data(
        messages=request.messages,
        schema=schema,
        model=request.model,
        api_key=credentials.credentials,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        max_attempts=request.max_attempts,
    )

    return ParseDataResponse[schema](data=data, usage=data._raw_response.usage)
