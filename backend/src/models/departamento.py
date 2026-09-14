from sqlalchemy import Column, String, Integer
from ..db.conection import Base

class DepartamentoModel(Base):
    __tablename__ = "departamento"

    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    

    def __init__(self, nome: str) -> None:
        self.nome = nome
    