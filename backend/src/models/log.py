from sqlalchemy import Column, Integer, String, Text, DateTime
from ..db.postgresql_conection import Base
from datetime import datetime

class LogModel(Base):
    __tablename__ = "log"

    id = Column(Integer, primary_key=True)
    matricula_quem_fez = Column(String(255), nullable=False)
    acao = Column(Text, nullable=False)
    tb_acao = Column(String(100))
    dt_acao = Column(DateTime, nullable=False)

    def __init__(self, matricula_quem_fez: str, acao: str, tb_acao, dt_acao: datetime = datetime.now()):
        self.matricula_quem_fez = matricula_quem_fez
        self.acao = acao
        self.tb_acao = tb_acao
        self.dt_acao = dt_acao

