# Configuração que já garante que as criações de todas tabelas

from ..db import Base, engine
from .user import UserModel
from .unidade import UnidadeModel
from .solicitacao import SolicitacaoEstadoEnum, SolicitacaoTipoEnum, SolicitacaoModel
from .registro import RegistroModel
from .produto import ProdutoModel 
from .fornecedor import FornecedorModel
from .estoque import EstoqueModel
from .estoque_solicitacao import EstoqueSolicitacaoModel
from .departamento import DepartamentoModel
from .contrados import ContradoModel
from categoria import CategoriaModel

__all__ = ["UserModel", "UnidadeModel", "SolicitacaoEstadoEnum", "SolicitacaoTipoEnum", "SolicitacaoModel",
           "RegistroModel", "ProdutoModel", "FornecedorModel", "EstoqueModel", "EstoqueSolicitacaoModel",
           "DepartamentoModel", "ContradoModel", "CategoriaModel"]

Base.metadata.create_all(bind=engine)