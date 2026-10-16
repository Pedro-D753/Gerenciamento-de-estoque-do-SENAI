from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSchema(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    matricula: str
    is_admin: bool
    is_ativo: bool

    unidade_id: int

class UserLoginSchema(BaseModel):
    matricula: int
    senha: str

class UserResteSenhaSchema(BaseModel):
    senha: str

class UserReadSchema(BaseModel):
    id: int
    nome: str
    email: EmailStr
    senha: str
    matricula: str
    is_admin: bool
    is_ativo: bool

    unidade_id: int

class UserUpdateSchema(BaseModel):
    nome: Optional[str]
    email: Optional[EmailStr]
    matricula: Optional[str]
    senha: Optional[str]
    is_admin: Optional[bool]
    is_ativo: Optional[bool]

    unidade_id: Optional[int]