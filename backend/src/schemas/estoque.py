from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from decimal import Decimal

class EstoqueSchema(BaseModel):
    qtd: int
    qtd_minima: int
    preco_unitario: Decimal = Field(max_digits=10, decimal_places=2)
    is_ativo: bool
    localidade: Optional[str]
    dt_validade: date

    produto_id: int
    unidade_id: int

class EstoqueReadSchema(BaseModel):
    id: int
    qtd: int
    qtd_minima: int
    preco_unitario: Decimal = Field(max_digits=10, decimal_places=2)
    is_ativo: bool
    localidade: Optional[str]
    dt_validade: Optional[date]

    produto_id: int
    unidade_id: int

class EstoqueUpdateSchema(BaseModel):
    id: Optional[int]
    qtd: Optional[int]
    qtd_minima: Optional[int]
    preco_unitario: Optional[Decimal]
    is_ativo: Optional[bool]
    localidade: Optional[str]
    dt_validade: Optional[date]

    produto_id: Optional[int]
    unidade_id: Optional[int]