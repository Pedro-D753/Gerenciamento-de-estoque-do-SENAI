from pydantic import BaseModel
from typing import Optional
from enum import Enum

class SolicitacaoSchema(BaseModel):
    is_aceito: bool
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    tipo: TipoEnum
    estado: EstadoEnum
    qtd_acao: int
    dt_acao: int

class SolicitacaoReadSchema(BaseModel):
    id: int
    is_aceito: bool
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    tipo: TipoEnum
    estado: EstadoEnum
    qtd_acao: int
    dt_acao: int

class SolicitacaoUpdateSchema(BaseModel):
    is_aceito: Optional[bool]
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    tipo: Optional[TipoEnum]
    estado: Optional[EstadoEnum]
    qtd_acao: Optional[int]
    dt_acao: Optional[int]

# enum class
class TipoEnum(str, Enum):
    Cancelada = "Cancelada"
    EmAndamento = "EmAndamento"
    Concluida = "Concluida"

class EstadoEnum(str, Enum):
    SA = "SA"
    ST = "ST"