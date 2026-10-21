from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ProdutoSchema(BaseModel):
    nome: str
    descricao: Optional[str]
    unidade_medida: str
    codigo_barra: int
    categoria_id: int

class ProdutoReadSchema(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    unidade_medida: str
    codigo_barra: int
    img_hash: Optional[str] = None
    categoria_id: int

class ProdutoUpdateSchema(BaseModel):
    nome: Optional[str]
    descricao: Optional[str]
    unidade_medida: Optional[str]
    codigo_barra: Optional[int]
    img_hash: Optional[str]
    categoria_id: Optional[int]  


class ProdutoComEstoqueSchema(ProdutoSchema):
    qtd: int = 0
    qtd_minima: int = 0
    preco_unitario: float = 0
    is_ativo: bool = True
    localidade: Optional[str] = None
    dt_validade: date = date(2099, 12, 31)

class ProdutoEstoquistaUpdateSchema(BaseModel):
    nome: str
    descricao: Optional[str] = None
    unidade_medida: str
    codigo_barra: int
    categoria_id: int
    qtd: int = Field(ge=0)
    qtd_minima: int = Field(ge=0)
    preco_unitario: float = Field(ge=0)
    is_ativo: bool
    dt_validade: Optional[date] = None

class ProdutoExclusaoSchema(BaseModel):
    motivo_exclusao: str = Field(min_length=1, max_length=2000)