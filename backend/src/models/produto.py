from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Boolean, Text
from ..db.conection import Base
from datetime import date

class ProdutoModel(Base):
    __tablename__ = "produto"

    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    unidade_medida = Column(String(50), nullable=False)
    codigo_barra = Column(Integer, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categoria.id"), nullable=False)
    departamento_id = Column(Integer, ForeignKey("departamento.id"), nullable=False)
    

    def __init__(self, nome: str, descricao: str, unidade_medida: str, codigo_barra: str, categoria: int, departamento: int) -> None:
        self.nome = nome
        self.descricao = descricao 
        self.unidade_medida = unidade_medida
        self.codigo_barra = codigo_barra

        self.categoria_id = categoria
        self.departamento_id = departamento
    
