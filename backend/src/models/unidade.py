from sqlalchemy import Column, String, Integer
from ..db.conection import Base

class UnidadeModel(Base):
    __tablename__ = "unidade"

    id = Column(Integer, primary_key=True)
    nome = Column(String(50), nullable=False)
    

    def __init__(self, nome: str) -> None:
        self.nome = nome
    
