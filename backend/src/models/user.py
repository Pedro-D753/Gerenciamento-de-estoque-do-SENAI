from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from ..db.conection import Base

class UserModel(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    matricula = Column(Integer, nullable=True)
    is_admin = Column(Boolean, nullable=False, default=0)
    is_ativo = Column(Boolean, nullable=False, default=1)

    unidade_id = Column(Integer, ForeignKey("unidade.id"), nullable=False)
    

    def __init__(self, nome: str, matricula: int, unidade: int, is_admin: bool = 0, is_ativo: bool = 1) -> None:
        self.nome = nome
        self.matricula = matricula
        self.is_admin = is_admin
        self.is_ativo = is_ativo

        self.unidade_id = unidade
    
