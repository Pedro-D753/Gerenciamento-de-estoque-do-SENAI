from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RegistroSchema(BaseModel):
    is_saida: bool
    descricao: Optional[str]
    qtd: int
    dt_registro: datetime

    estoque_id: int

class RegistroReadSchema(BaseModel):
    id: int
    is_saida: bool
    descricao: Optional[str]
    qtd: int
    dt_registro: datetime

    estoque_id: int

class RegistroUpdateSchema(BaseModel):
    is_saida: Optional[bool]
    descricao: Optional[str]
    qtd: Optional[int]
    dt_registro: Optional[datetime]

    estoque_id: Optional[int]