from sqlalchemy import Column, ForeignKey, Integer
from ..db.postgresql_conection import Base

class EstoqueSolicitacaoModel(Base):
    __tablename__ = "estoque_solicitacao"

    id = Column(Integer, primary_key=True)

    estoque_id = Column(Integer, ForeignKey("estoque.id"), nullable=False)
    solicitacao_id = Column(Integer, ForeignKey("solicitacao.id"), nullable=False)
    

    def __init__(self, estoque: int, solicitacao: int )-> None:
        self.estoque_id = estoque
        self.solicitacao_id = solicitacao
    
