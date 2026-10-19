from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum
from datetime import datetime

class TipoEnum(str, Enum):
    Cancelada = "Cancelada"
    EmAndamento = "EmAndamento"
    Separada = "Separada"
    Retirada = "Retirada"
    Concluida = "Concluida"

class EstadoEnum(str, Enum):
    SA = "SA"
    ST = "ST"

class SolicitacaoSchema(BaseModel):
    is_aceito: bool
    obs_solicita: Optional[str]
    obs_recusa: Optional[str]
    obs_pad: Optional[str] = None
    tipo: TipoEnum
    estado: EstadoEnum
    qtd_acao: int = Field(gt=0)
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
    obs_pad: Optional[str] = None
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
    obs_pad: Optional[str] = None
    tipo: Optional[TipoEnum] = None
    estado: Optional[EstadoEnum] = None
    qtd_acao: Optional[int] = Field(default=None, gt=0)
    dt_acao: Optional[datetime] = None
    estoque_id: Optional[int] = None
    solicitante: Optional[str] = None
    dt_solicitacao: Optional[datetime] = None
    dt_retirada: Optional[datetime] = None

class SolicitacaoRecusaSchema(BaseModel):
    obs_pad: str = Field(min_length=1, max_length=2000)
    obs_recusa: str = Field(min_length=1, max_length=2000)

    @field_validator("obs_pad", "obs_recusa")
    @classmethod
    def validar_texto_obrigatorio(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo é obrigatório.")
        return value