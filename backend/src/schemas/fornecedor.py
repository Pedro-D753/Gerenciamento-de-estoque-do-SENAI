from pydantic import BaseModel
from typing import Optional

class FornecedorSchema(BaseModel):
    nome: str
    cnpj: int
    contato: Optional[str]
    is_ativo: bool

class FornecedorReadSchema(BaseModel):
    id: int
    nome: str
    cnpj: int
    contato: Optional[str]
    is_ativo: bool

class FornecedorUpdateSchema(BaseModel):
    nome: Optional[str]
    cnpj: Optional[int]
    contato: Optional[str]
    is_ativo: Optional[bool]