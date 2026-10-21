from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, ForeignKey, Boolean, Text, func
from ..db.postgresql_conection import Base
from datetime import date

class EstoqueModel(Base):
    __tablename__ = "estoque"

    id = Column(Integer, primary_key=True)
    qtd = Column(Integer, nullable=False)
    qtd_minima = Column(Integer, nullable=False)
    preco_unitario = Column(Numeric(10, 2), nullable=False)
    is_ativo = Column(Boolean, nullable=False, default=1)
    is_excluido = Column(Boolean, nullable=False, default=False)
    motivo_exclusao = Column(Text, nullable=True)
    dt_exclusao = Column(DateTime(timezone=True), nullable=True)
    dt_entrada = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    localidade = Column(String(255), nullable=True)
    dt_validade = Column(Date, nullable=True)

    produto_id = Column(Integer, ForeignKey("produto.id"), nullable=False)
    unidade_id = Column(Integer, ForeignKey("unidade.id"), nullable=False)
    

    def __init__(self, qtd: int, qtd_minima: int, preco_unitario: float, is_ativo: bool, localidade: str, dt_validade: date, produto: int, unidade: int) -> None:
        self.qtd = qtd
        self.qtd_minima = qtd_minima 
        self.preco_unitario = preco_unitario
        self.is_ativo = is_ativo
        self.localidade = localidade
        self.dt_validade = dt_validade
        self.produto_id = produto
        self.unidade_id = unidade

    
