from pydantic import BaseModel
from typing import Optional

class UserSchema(BaseModel):
    nome: str
    senha: str
    matricula: int
    is_admin: bool
    is_ativo: bool

    unidade_id: int

class UserLoginSchema(BaseModel):
    matricula: int
    senha: str

class UserReadSchema(BaseModel):
    id: int
    nome: str
    senha: str
    matricula: int
    is_admin: bool
    is_ativo: bool

    unidade_id: int

class UserUpdateSchema(BaseModel):
    nome: Optional[str]
    matricula: Optional[int]
    senha: Optional[str]
    is_admin: Optional[bool]
    is_ativo: Optional[bool]

    unidade_id: Optional[int]