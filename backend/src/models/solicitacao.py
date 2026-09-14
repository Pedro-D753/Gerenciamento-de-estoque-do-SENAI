from sqlalchemy import Column, Integer, Boolean, Text
from sqlalchemy import Enum

from ..db.conection import Base
from datetime import datetime

class SolicitacaoModel(Base):
    __tablename__ = "solicitacao"

    id = Column(Integer, primary_key=True)
    is_aceito = Column(Boolean, nullable=False)
    descricao = Column(Text, nullable=True)
    tipo = Column(Enum, nullable=False)
    qtd_acao = Column(Integer, nullable=False)
    dt_acao = Column(Integer, nullable=False)
    estado = Column(Enum,)

    

    def __init__(self, is_aceito: bool, descricao: str, qtd_acao: int, dt_acao: datetime = datetime.now()) -> None:
        self.nome = nome
        self.descricao = descricao 
        self.unidade_medida = unidade_medida
        self.codigo_barra = codigo_barra

        self.categoria_id = categoria
        self.departamento_id = departamento
    
