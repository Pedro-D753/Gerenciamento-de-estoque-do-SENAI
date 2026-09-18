from pydantic import BaseModel
from datetime import date
from typing import Optional

class ContratoSchema(BaseModel):
    dt_inicio: date
    dt_final: date

    registro_id: int
    fornecedor_id: int

class ContratoReadSchema(BaseModel):
    id: int
    dt_inicio: date
    dt_final: date

    registro_id: int
    fornecedor_id: int

class ContratoUpdateSchema(BaseModel):
    dt_inicio: Optional[date]
    dt_final: Optional[date]

    registro_id: Optional[int]
    fornecedor_id: Optional[int]