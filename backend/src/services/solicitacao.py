from ..models.solicitacao import SolicitacaoModel
from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from ..models.estoque import EstoqueModel
from ..models.produto import ProdutoModel
from ..models.unidade import UnidadeModel
from .erros import ErroInesperado, ErroSolicitacaoExiste, ErroSolicitacaoNaoEncontrado
from .estoque_solicitado import criar_estoque_solicitado, atualizar_estoque_solicitado, excluir_estoque_solicitado


def _serializar_solicitacao(solicitacao, estoque_solicitado, estoque=None, produto=None, unidade=None):
    return {
        "solicitacao": {
            "id": solicitacao.id,
            "is_aceito": solicitacao.is_aceito,
            "obs_solicita": solicitacao.obs_solicita,
            "obs_recusa": solicitacao.obs_recusa,
            "tipo": solicitacao.tipo,
            "estado": solicitacao.estado,
            "qtd_acao": solicitacao.qtd_acao,
            "dt_acao": solicitacao.dt_acao,
            "solicitante": solicitacao.solicitante,
            "dt_solicitacao": solicitacao.dt_solicitacao,
            "dt_retirada": solicitacao.dt_retirada,
        },
        "estoque_solicitado": {
            "id": estoque_solicitado.id,
            "estoque_id": estoque_solicitado.estoque_id,
            "solicitacao_id": estoque_solicitado.solicitacao_id,
            "produto_id": estoque.produto_id if estoque else None,
            "produto_nome": produto.nome if produto else None,
            "produto_codigo": produto.codigo_barra if produto else None,
            "unidade_nome": unidade.nome if unidade else None,
        },
    }

#region FUNCAO CRIAR SOLICITACAO
def criar_solicitacao(session, dados):
    # verifica se essa solicitacao já existe
    existe = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados.is_aceito,
                                                    SolicitacaoModel.obs_solicita == dados.obs_solicita,
                                                    SolicitacaoModel.obs_recusa == dados.obs_recusa,
                                                    SolicitacaoModel.tipo == dados.tipo,
                                                    SolicitacaoModel.estado == dados.estado,
                                                    SolicitacaoModel.qtd_acao == dados.qtd_acao,
                                                    SolicitacaoModel.dt_acao == dados.dt_acao).first()
    if existe:
        raise ErroSolicitacaoExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto solicitacao
        solicitacao = SolicitacaoModel(
            dados.is_aceito, dados.obs_solicita, dados.obs_recusa, dados.tipo,
            dados.estado, dados.qtd_acao, dados.dt_acao, dados.solicitante,
            dados.dt_solicitacao, dados.dt_retirada
        )

        # adiciona o objeto no banco e salva
        session.add(solicitacao)
        session.flush()

        criar_estoque_solicitado(session, dados, solicitacao)
        
        session.commit()


        return {"mensagem":"Solicitacao criada com sucesso!"}
    
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER SOLICITACAO
def ler_solicitacao(session):
    resultados = (
        session.query(SolicitacaoModel, EstoqueSolicitacaoModel, EstoqueModel, ProdutoModel, UnidadeModel)
        .join(EstoqueSolicitacaoModel, SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id)
        .join(EstoqueModel, EstoqueModel.id == EstoqueSolicitacaoModel.estoque_id)
        .join(ProdutoModel, ProdutoModel.id == EstoqueModel.produto_id)
        .join(UnidadeModel, UnidadeModel.id == EstoqueModel.unidade_id)
        .all()
    )
    return [_serializar_solicitacao(solicitacao, estoque_solicitado, estoque, produto, unidade)
            for solicitacao, estoque_solicitado, estoque, produto, unidade in resultados]

def ler_solicitacao_id(session, id):
    resultado = (
        session.query(SolicitacaoModel, EstoqueSolicitacaoModel, EstoqueModel, ProdutoModel, UnidadeModel)
        .join(EstoqueSolicitacaoModel, SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id)
        .join(EstoqueModel, EstoqueModel.id == EstoqueSolicitacaoModel.estoque_id)
        .join(ProdutoModel, ProdutoModel.id == EstoqueModel.produto_id)
        .join(UnidadeModel, UnidadeModel.id == EstoqueModel.unidade_id)
        .filter(SolicitacaoModel.id == id)
        .first()
    )

    if not resultado:
        return None

    solicitacao, estoque_solicitado, estoque, produto, unidade = resultado
    return _serializar_solicitacao(solicitacao, estoque_solicitado, estoque, produto, unidade)
#endregion

#region FUNCAO ATUALIZAR SOLICITACAO
def atualizar_solicitacao(session, id, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(SolicitacaoModel).filter(SolicitacaoModel.id == id).first()
    
    existe_new = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados_new.is_aceito,
                                                        SolicitacaoModel.obs_solicita == dados_new.obs_solicita,
                                                        SolicitacaoModel.obs_recusa == dados_new.obs_recusa,
                                                        SolicitacaoModel.tipo == dados_new.tipo,
                                                        SolicitacaoModel.estado == dados_new.estado,
                                                        SolicitacaoModel.qtd_acao == dados_new.qtd_acao,
                                                        SolicitacaoModel.dt_acao == dados_new.dt_acao).first()
    # se os dados antigos da Solicitacao nao existir
    if not existe_old:
        raise ErroSolicitacaoNaoEncontrado(session)
    
    # se os dados novos já existirem em outra Solicitacao
    if existe_new:
        raise ErroSolicitacaoExiste(session)
    
    # tratamento de erro
    try:
        # atualiza o objeto Solicitacao
        for field in ("is_aceito", "obs_solicita", "obs_recusa", "tipo", "estado", "qtd_acao", "dt_acao", "solicitante", "dt_solicitacao", "dt_retirada"):
            value = getattr(dados_new, field)
            if value is not None:
                setattr(existe_old, field, value)

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

        if dados_new.estoque_id is not None:
            atualizar_estoque_solicitado(session, id, dados_new)

        return {"mensagem":"Solicitacao atualizada com sucesso!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion
       
#region FUNCAO EXCLUIR SOLICITACAO
def excluir_solicitacao(session, id):
    # verifica se existe essa solicitacao no banco
    existe = session.query(SolicitacaoModel).filter(SolicitacaoModel.id == id).first()
    if not existe:
        raise ErroSolicitacaoNaoEncontrado(session)
    
    # tratamento de erro
    try:
        excluir_estoque_solicitado(session, id)

        session.flush()

        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        
        session.commit()


        return {"mensagem":"Solicitacao foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion