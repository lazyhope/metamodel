from typing import Generic, Literal, TypeVar

from litellm import Usage
from pydantic import BaseModel, Field, SkipValidation
from typing_extensions import TypedDict

from .metamodel import ModelType

T_Model = TypeVar("T_Model", bound=BaseModel)


class Message(TypedDict):
    role: Literal["user", "system", "assistant"]
    content: str | list[dict]


class DefineSchemaRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)
    model: str = "gpt-4o"
    temperature: float = Field(default=0, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=1)
    max_attempts: int = Field(default=3, ge=1)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "content": "Generate a reasonable schema, with attributes of various (but not redundant) types, constraints and one very simple nested schema with two attributes. Try to use as few attributes as possible to create most varieties",
                            "role": "user",
                        }
                    ],
                    "temperature": 0.0,
                    "max_tokens": 4096,
                    "max_attempts": 3,
                }
            ]
        }
    }


class DefineSchemaResponse(BaseModel):
    data: ModelType
    usage: Usage

    model_config = {"json_schema_extra": {"examples": []}}


class ParseDataRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)
    definition: ModelType = Field(
        title="Schema Definition", alias="schema"
    )  # `definition` will appear as `schema` in API spec
    model: str = "gpt-4o"
    temperature: float = Field(default=0, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=1)
    max_attempts: int = Field(default=3, ge=1)

    model_config = {
        "json_schema_extra": {
            "examples": [],
        }
    }


class ParseDataResponse(BaseModel, Generic[T_Model]):
    data: SkipValidation[T_Model]
    usage: Usage

    model_config = {
        "json_schema_extra": {
            "examples": [],
        }
    }
