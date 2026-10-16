from pydantic import BaseModel
from typing import Optional

class FornecedorSchema(BaseModel):
    nome: str
    cnpj: str
    contato: Optional[str]
    is_ativo: bool

class FornecedorReadSchema(BaseModel):
    id: int
    nome: str
    cnpj: str
    contato: Optional[str]
    is_ativo: bool

class FornecedorUpdateSchema(BaseModel):
    nome: Optional[str]
    cnpj: Optional[str]
    contato: Optional[str]
    is_ativo: Optional[bool]