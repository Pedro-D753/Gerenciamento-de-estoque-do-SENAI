from pydantic import BaseModel
from typing import Optional

class ProdutoSchema(BaseModel):
    nome: str
    descricao: Optional[str]
    unidade_medida: str
    codigo_barra: int

    categoria_id: int
    departamento_id: int

class ProdutoReadSchema(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    unidade_medida: str
    codigo_barra: int

    categoria_id: int
    departamento_id: int

class ProdutoUpdateSchema(BaseModel):
    nome: Optional[str]
    descricao: Optional[str]
    unidade_medida: Optional[str]
    codigo_barra: Optional[int]

    categoria_id: Optional[int]
    departamento_id: Optional[int]     