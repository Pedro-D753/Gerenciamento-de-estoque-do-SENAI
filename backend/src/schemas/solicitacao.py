from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class TipoEnum(str, Enum):
    Cancelada = "Cancelada"
    EmAndamento = "EmAndamento"
    Concluida = "Concluida"

class EstadoEnum(str, Enum):
    SA = "SA"
    ST = "ST"

class SolicitacaoSchema(BaseModel):
    is_aceito: bool
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    tipo: TipoEnum
    estado: EstadoEnum
    qtd_acao: int
    dt_acao: datetime
    estoque_id: int
    solicitante: Optional[str] = None
    dt_solicitacao: Optional[datetime] = None
    dt_retirada: Optional[datetime] = None

class SolicitacaoReadSchema(BaseModel):
    id: int
    is_aceito: bool
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    tipo: TipoEnum
    estado: EstadoEnum
    qtd_acao: int
    dt_acao: datetime
    estoque_id: int
    solicitante: Optional[str] = None
    dt_solicitacao: Optional[datetime] = None
    dt_retirada: Optional[datetime] = None

class SolicitacaoUpdateSchema(BaseModel):
    is_aceito: Optional[bool] = None
    obs_solicita: Optional[str] = None
    obs_recusa: Optional[str] = None
    tipo: Optional[TipoEnum] = None
    estado: Optional[EstadoEnum] = None
    qtd_acao: Optional[int] = None
    dt_acao: Optional[datetime] = None
    estoque_id: Optional[int] = None
    solicitante: Optional[str] = None
    dt_solicitacao: Optional[datetime] = None
    dt_retirada: Optional[datetime] = None