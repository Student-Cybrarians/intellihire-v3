"""
IntelliHire v3 - Base Schema Module
Provides unified serialization, validation, and conversion across Pydantic v2 and pure Python.
"""
from typing import Any, Dict, List, Optional, Union
import json
from dataclasses import dataclass, field, asdict

try:
    from pydantic import BaseModel, Field, ConfigDict
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False

    class BaseModel:
        """Fallback BaseModel when pydantic is not installed."""
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def model_dump(self, mode: str = "python", exclude_none: bool = False) -> Dict[str, Any]:
            result = {}
            for k, v in self.__dict__.items():
                if k.startswith("_"):
                    continue
                if exclude_none and v is None:
                    continue
                if isinstance(v, BaseModel):
                    result[k] = v.model_dump(mode=mode, exclude_none=exclude_none)
                elif isinstance(v, list):
                    result[k] = [
                        item.model_dump(mode=mode, exclude_none=exclude_none) if isinstance(item, BaseModel) else item
                        for item in v
                    ]
                else:
                    result[k] = v
            return result

        def model_dump_json(self, indent: Optional[int] = None) -> str:
            return json.dumps(self.model_dump(), indent=indent, default=str)

        @classmethod
        def model_validate(cls, obj: Any) -> Any:
            if isinstance(obj, cls):
                return obj
            if isinstance(obj, dict):
                return cls(**obj)
            raise ValueError(f"Cannot validate {type(obj)} as {cls.__name__}")

        def dict(self, *args, **kwargs):
            return self.model_dump()

        def json(self, *args, **kwargs):
            return self.model_dump_json()

    def Field(default: Any = ..., default_factory: Any = None, description: str = "", **kwargs):
        if default_factory is not None:
            return field(default_factory=default_factory)
        return field(default=default if default is not ... else None)
