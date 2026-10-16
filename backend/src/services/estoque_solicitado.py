from ..models.estoque import EstoqueModel
from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from ..models.solicitacao import SolicitacaoModel
from .erros import ErroEstoqueNaoEncontrado, ErroEstoqueSolicitadoExiste, ErroEstoqueSolicitadoNaoEncontrado, ErroInesperado

#region FUNCAO DE CRIA ESTOQUE SOLICITADO
def criar_estoque_solicitado(session, dados):
    solicitacao = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados.is_aceito,
                                                    SolicitacaoModel.obs_solicita == dados.obs_solicita,
                                                    SolicitacaoModel.obs_recusa == dados.obs_recusa,
                                                    SolicitacaoModel.tipo == dados.tipo,
                                                    SolicitacaoModel.estado == dados.estado,
                                                    SolicitacaoModel.qtd_acao == dados.qtd_acao,
                                                    SolicitacaoModel.dt_acao == dados.dt_acao).first()
    
    # verifica se existe
    existe = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.estoque_id == dados.estoque_id,
                                                           EstoqueSolicitacaoModel.solicitacao_id == solicitacao.id).first()
    if existe:
        raise ErroEstoqueSolicitadoExiste(session)

    # tratamento de erro
    try:
        # cria objeto
        estoquesolicitado = EstoqueSolicitacaoModel(dados.estoque_id, solicitacao.id)

        # adiciona no banco e salva
        session.add(estoquesolicitado)

        return {"mensagem":"Essa solicitacao de estoque foi criada com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO DE ATUALIZAR ESTOQUE SOLICITADO
def atualizar_estoque_solicitado(session, id, dados_new):
    # verifica se existe
    existe_old = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.solicitacao_id == id).first()
    if not existe_old:
        raise ErroEstoqueSolicitadoNaoEncontrado(session)

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.estoque_id = dados_new.estoque_id

        # atualiza a alteracao no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Essa solicitacao de estoque foi atualizada com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO DE EXCLUIR ESTOQUE SOLICITADO
def excluir_estoque_solicitado(session, id):
    # verifica se existe
    existe = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.solicitacao_id == id).first()
    if not existe:
        raise ErroEstoqueSolicitadoNaoEncontrado(session)

    # tratamento de erros
    try:
        # exclui o objeto do banco
        session.delete(existe)

        return {"mensagem":"Essa solicitacao de estoque foi excluida com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion