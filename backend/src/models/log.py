from sqlalchemy import Column, Integer, String, Text, DateTime
from ..db.postgresql_conection import Base
from sqlalchemy.sql import func
from datetime import datetime

class LogModel(Base):
    __tablename__ = "log"

    id = Column(Integer, primary_key=True)
    matricula_quem_fez = Column(String(255), nullable=False)
    acao = Column(Text, nullable=False)
    tb_acao = Column(String(100), nullable=False)
    dt_acao = Column(DateTime, nullable=False, server_default=func.now())