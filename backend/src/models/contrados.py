from sqlalchemy import Column, String, Integer, Date, ForeignKey
from ..db.conection import Base
from datetime import date

class ContradoModel(Base):
    __tablename__ = "contrado"

    id = Column(Integer, primary_key=True)
    dt_incio = Column(Date, nullable=False)
    dt_final = Column(Date, nullable=False)

    registro_id = Column(Integer, ForeignKey("registro.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedor.id"), nullable=False)
    

    def __init__(self, dt_inicio: date, dt_final: date, registro: int, fornecedor: int) -> None:
        self.dt_incio = dt_inicio
        self.dt_final = dt_final
    
        self.registro_id = registro
        self.fornecedor_id = fornecedor
    
