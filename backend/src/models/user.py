from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from passlib.hash import sha256_crypt as sha256
from hmac import compare_digest
from ..db.postgresql_conection import Base

class UserModel(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    senha = Column(String(255), nullable=False)
    matricula = Column(String(255), nullable=True, unique=True)
    is_admin = Column(Boolean, nullable=False, default=0)
    is_ativo = Column(Boolean, nullable=False, default=1)

    unidade_id = Column(Integer, ForeignKey("unidade.id"), nullable=False)
    

    def __init__(self, nome: str, email: str, senha: str, matricula: str, unidade: int, is_admin: bool = 0, is_ativo: bool = 1) -> None:
        self.nome = nome
        self.email = email
        self.senha = sha256.encrypt(senha)
        self.matricula = matricula
        self.is_admin = is_admin
        self.is_ativo = is_ativo

        self.unidade_id = unidade


    def verificarSenha(self, senha: str) -> bool:
        if sha256.identify(self.senha):
            return sha256.verify(senha, self.senha)

        # Upgrade users created by older versions that stored the password directly.
        if compare_digest(senha, self.senha):
            self.senha = sha256.encrypt(senha)
            return True

        return False

    def novaSenha(self, nova_senha) -> None:
        self.senha = sha256.encrypt(nova_senha)
