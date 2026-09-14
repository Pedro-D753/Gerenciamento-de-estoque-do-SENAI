from sqlalchemy import Column, Integer, Boolean, Text, Enum
from datetime import datetime
import enum

from ..db.conection import Base

class SolicitacaoEstadoEnum(enum.Enum):
    #SA = solicitação normal
    SA = "SA"
    #ST = solicitação de transferencia entre unidades
    ST = "ST"

class SolicitacaoTipoEnum(enum.Enum):
    Cancelada = "Cancelada" 
    EmAndamento = "EmAndamento"
    Concluida = "Concluida"

class SolicitacaoModel(Base):
    __tablename__ = "solicitacao"

    id = Column(Integer, primary_key=True)
    is_aceito = Column(Boolean, nullable=False)
    descricao = Column(Text, nullable=True)
    tipo = Column(Enum(SolicitacaoTipoEnum), nullable=False)
    estado = Column(Enum(SolicitacaoEstadoEnum), nullable=False, default=SolicitacaoEstadoEnum.SA)
    qtd_acao = Column(Integer, nullable=False)
    dt_acao = Column(Integer, nullable=False)

    def __init__(self, is_aceito: bool, descricao: str, tipo: SolicitacaoTipoEnum, estado: SolicitacaoEstadoEnum ,qtd_acao: int, dt_acao: datetime = datetime.now()) -> None:
        self.is_aceito = is_aceito
        self.descricao = descricao
        self.tipo = tipo
        self.estado = estado
        self.qtd_acao = qtd_acao
        self.dt_acao = dt_acao
    
  
