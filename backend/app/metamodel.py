from collections import OrderedDict
from decimal import Decimal
from functools import reduce
from operator import or_
from typing import (
    Annotated,
    Any,
    Literal,
    Optional,
    Pattern,
    TypeAlias,
    Union,
    get_origin,
)

from pydantic import BaseModel, Field, create_model

PrimitiveTypes = Literal["string", "integer", "decimal", "boolean"]
SingularTypes: TypeAlias = Union[
    "AnnotatedType", "ArrayType", "DictType", "EnumType", "ModelType", PrimitiveTypes
]
FieldTypes: TypeAlias = (
    SingularTypes | Annotated[list[SingularTypes], Field(min_length=1)]
)


class EnumType(BaseModel):
    enums: list[str | int | Decimal | bool] = Field(min_length=1)


class ArrayType(BaseModel):
    array_type: Literal["list", "set"]
    item_type: FieldTypes | None = None


class DictType(BaseModel):
    key_type: FieldTypes | None
    value_type: FieldTypes | None


class AnnotatedType(BaseModel):
    type: FieldTypes
    optional: bool = False
    default: str | int | bool | Decimal | dict | list | None = None
    description: str | None = None
    examples: list | None = None
    gt: float | None = None
    ge: float | None = None
    lt: float | None = None
    le: float | None = None
    multiple_of: int | float | None = None
    allow_inf_nan: bool | None = None
    max_digits: int | None = Field(default=None, ge=0)
    decimal_places: int | None = Field(default=None, ge=0)
    pattern: Pattern[str] | None = None
    min_length: int | None = Field(default=None, ge=0)
    max_length: int | None = Field(default=None, ge=0)


class ModelType(BaseModel):
    name: str = Field(min_length=1)
    fields: OrderedDict[str, FieldTypes] = Field(min_length=1)


def to_python_type(type: FieldTypes):
    if isinstance(type, AnnotatedType):
        field_type = to_python_type(type.type)
        if type.optional:
            field_type = Optional[field_type]
        # Avoid ambiguity when default is None and type is optional
        field_args = type.model_dump(exclude={"type", "optional"}, exclude_unset=True)
        if field_args:
            field_type = Annotated[field_type, Field(**field_args)]
    elif type == "string":
        field_type = str
    elif type == "integer":
        field_type = int
    elif type == "decimal":
        field_type = Decimal
    elif type == "boolean":
        field_type = bool
    elif isinstance(type, ArrayType):
        field_type = set if type.array_type == "set" else list
        if type.item_type is not None:
            field_type = field_type[to_python_type(type.item_type)]
    elif isinstance(type, DictType):
        field_type = dict[
            Any if type.key_type is None else to_python_type(type.key_type),
            Any if type.value_type is None else to_python_type(type.value_type),
        ]
    elif isinstance(type, EnumType):
        field_type = Literal[*type.enums]  # type: ignore
    elif isinstance(type, list):
        field_type = reduce(or_, (to_python_type(sub_type) for sub_type in type))
    elif isinstance(type, ModelType):
        subfields = {}
        for subfield_name, subfield_info in type.fields.items():
            subfield_type = to_python_type(subfield_info)
            if get_origin(subfield_type) is not Annotated:
                subfield_type = Annotated[subfield_type, Field(...)]
            subfields[subfield_name] = subfield_type

        field_type = create_model(
            type.name,
            **subfields,
        )
    else:
        assert False, f"Unknown type: {type}"

    return field_type
