# Configuração que já garante que as criações de todas tabelas
from sqlalchemy import text

from ..db.postgresql_conection import Base, engine
from .user import UserModel
from .unidade import UnidadeModel
from .solicitacao import SolicitacaoEstadoEnum, SolicitacaoTipoEnum, SolicitacaoModel
from .registro import RegistroModel
from .produto import ProdutoModel 
from .fornecedor import FornecedorModel
from .estoque import EstoqueModel
from .estoque_solicitacao import EstoqueSolicitacaoModel
from .contratos import ContratoModel
from .categoria import CategoriaModel
from .log import LogModel

__all__ = ["UserModel", "UnidadeModel", "SolicitacaoEstadoEnum", "SolicitacaoTipoEnum", "SolicitacaoModel",
           "RegistroModel", "ProdutoModel", "FornecedorModel", "EstoqueModel", "EstoqueSolicitacaoModel",
            "ContratoModel", "CategoriaModel", "LogModel"]

Base.metadata.create_all(bind=engine)

# Atualiza bancos já existentes, pois create_all não altera colunas criadas anteriormente.
with engine.begin() as connection:
    connection.execute(text("ALTER TABLE produto ALTER COLUMN img_hash DROP NOT NULL"))
    connection.execute(
        text(
            "ALTER TABLE \"log\" "
            "ALTER COLUMN matricula_quem_fez TYPE VARCHAR(255) "
            "USING matricula_quem_fez::VARCHAR"
        )
    )
    connection.execute(text("ALTER TABLE solicitacao ADD COLUMN IF NOT EXISTS solicitante VARCHAR(255)"))
    connection.execute(text("ALTER TABLE solicitacao ADD COLUMN IF NOT EXISTS dt_solicitacao TIMESTAMP"))
    connection.execute(text("ALTER TABLE solicitacao ADD COLUMN IF NOT EXISTS dt_retirada TIMESTAMP"))
    connection.execute(text("ALTER TABLE solicitacao ADD COLUMN IF NOT EXISTS obs_pad TEXT"))
    connection.execute(text("ALTER TYPE solicitacaotipoenum ADD VALUE IF NOT EXISTS 'Separada'"))
    connection.execute(text("ALTER TYPE solicitacaotipoenum ADD VALUE IF NOT EXISTS 'Retirada'"))