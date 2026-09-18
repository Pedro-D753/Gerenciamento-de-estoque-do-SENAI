from pydantic import BaseModel
from typing import Optional

class EstoquesolicitadoSchema(BaseModel):
    estoque_id: int
    solicitacao_id: int

class EstoquesolicitadoReadSchema(BaseModel):
    id: int
    estoque_id: int
    solicitado_id: int

class EstoquesolicitadoUpdateSchema(BaseModel):
    estoque_id: Optional[int]
    solicitado_id: Optional[int]