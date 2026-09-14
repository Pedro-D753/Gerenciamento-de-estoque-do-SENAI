from sqlalchemy import Column, DateTime, Integer, ForeignKey, Text, Boolean
from datetime import datetime

from ..db.conection import Base

class RegistroModel(Base):
    __tablename__ = "registro"

    id = Column(Integer, primary_key=True)
    is_saida = Column(Boolean, nullable=False, default=0)
    descricao = Column(Text, nullable=True)
    qtd = Column(Integer, nullable=False)
    dt_registro = Column(DateTime, nullable=False)

    estoque_id = Column(Integer, ForeignKey("categoria.id"), nullable=False)
    

    def __init__(self, descricao : str, qtd : int, dt_registro : datetime, estoque: int, is_saida: bool = False) -> None:
        self.is_saida =  is_saida
        self.descricao = descricao
        self.qtd = qtd
        self.dt_registro = dt_registro

        self.estoque_id = estoque
    
