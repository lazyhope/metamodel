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
    model: str
    temperature: float = Field(default=0, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=1)
    max_attempts: int = Field(default=3, ge=1)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "model": "gemini/gemini-1.5-pro-exp-0801",
                    "messages": [
                        {
                            "content": "Generate a user schema, with attributes of various (but not redundant) types, constraints and one very simple nested schema with two attributes. Try to use as few attributes as possible to create most varieties",
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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": {
                        "name": "Person",
                        "fields": {
                            "name": {
                                "type": "string",
                                "optional": False,
                                "min_length": 2,
                                "max_length": 50,
                            },
                            "age": {
                                "type": "integer",
                                "optional": True,
                                "ge": 0,
                                "lt": 150,
                            },
                            "email": {
                                "type": "string",
                                "optional": False,
                                "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
                            },
                            "interests": {"array_type": "list", "item_type": "string"},
                            "address": {
                                "name": "Address",
                                "fields": {"street": "string", "city": "string"},
                            },
                        },
                    },
                    "usage": {
                        "prompt_tokens": 100,
                        "completion_tokens": 150,
                        "total_tokens": 250,
                    },
                }
            ]
        }
    }


class ParseDataRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)
    definition: ModelType = Field(
        title="Schema Definition", alias="schema"
    )  # `definition` will appear as `schema` in API spec
    model: str
    temperature: float = Field(default=0, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=1)
    max_attempts: int = Field(default=3, ge=1)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": "Parse the following data into the Person schema: John Doe, 30 years old, john@example.com, likes reading and hiking, lives at 123 Main St, Springfield",
                        }
                    ],
                    "schema": {
                        "name": "Person",
                        "fields": {
                            "name": "string",
                            "age": "integer",
                            "email": "string",
                            "interests": {"array_type": "list", "item_type": "string"},
                            "address": {
                                "name": "Address",
                                "fields": {"street": "string", "city": "string"},
                            },
                        },
                    },
                    "model": "gemini/gemini-1.5-pro-exp-0801",
                    "temperature": 0,
                    "max_tokens": 1000,
                    "max_attempts": 3,
                }
            ]
        }
    }


class ParseDataResponse(BaseModel, Generic[T_Model]):
    data: SkipValidation[T_Model]
    usage: Usage

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": {
                        "name": "John Doe",
                        "age": 30,
                        "email": "john@example.com",
                        "interests": ["reading", "hiking"],
                        "address": {"street": "123 Main St", "city": "Springfield"},
                    },
                    "usage": {
                        "prompt_tokens": 200,
                        "completion_tokens": 100,
                        "total_tokens": 300,
                    },
                }
            ]
        }
    }
