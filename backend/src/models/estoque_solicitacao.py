from sqlalchemy import Column, ForeignKey, Integer
from ..db.conection import Base

class EstoqueSolicitacaoModel(Base):
    __tablename__ = "estoque_solicitacao"

    id = Column(Integer, primary_key=True)

    estoque_id = Column(Integer, ForeignKey("estoque.id"), nullable=False)
    solicitacao_id = Column(Integer, ForeignKey("solicitacao.id"), nullable=False)
    

    def __init__(self, estoque: int, departamento: int )-> None:
        self.categoria_id = estoque
        self.departamento_id = departamento
    
