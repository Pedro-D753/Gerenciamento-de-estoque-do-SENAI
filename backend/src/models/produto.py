from sqlalchemy import Column, String, Integer, ForeignKey, Text
from ..db.postgresql_conection import Base

class ProdutoModel(Base):
    __tablename__ = "produto"

    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    img_hash = Column(Text, nullable=False)
    unidade_medida = Column(String(50), nullable=False)
    codigo_barra = Column(Text, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categoria.id"), nullable=False)
    

    def __init__(self, nome: str, descricao: str, img_hash: str, unidade_medida: str, codigo_barra: str, categoria: int) -> None:
        self.nome = nome
        self.descricao = descricao 
        self.img_hash = img_hash
        self.unidade_medida = unidade_medida
        self.codigo_barra = codigo_barra

        self.categoria_id = categoria
    
