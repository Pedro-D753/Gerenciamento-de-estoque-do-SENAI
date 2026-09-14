from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from ..db.conection import Base

class FornecedorModel(Base):
    __tablename__ = "fornecedor"

    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(Integer, nullable=False)
    contato = Column(String(120), nullable=True)
    is_ativo = Column(Boolean, nullable=False)
    

    def __init__(self, nome: str, cnpj: int, contato: str, is_ativo: bool = 1) -> None:
        self.nome = nome
        self.cnpj = cnpj
        self.contato = contato
        self.is_ativo = is_ativo

    
