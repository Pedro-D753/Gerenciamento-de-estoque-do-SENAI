from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from .erros import ErroEstoqueSolicitadoExiste, ErroEstoqueSolicitadoNaoEncontrado, ErroInesperado

#region FUNCAO DE CRIA ESTOQUE SOLICITADO
def criar_estoque_solicitado(session, dados):
    # verifica se existe
    existe = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.estoque_id == dados.estoque_id,
                                                           EstoqueSolicitacaoModel.solicitacao_id == dados.solicitacao_id).first()
    if existe:
        raise ErroEstoqueSolicitadoExiste(session)

    # tratamento de erro
    try:
        # cria objeto
        estoquesolicitado = EstoqueSolicitacaoModel(dados.estoque_id, dados.solicitacao_id)

        # adiciona no banco e salva
        session.add(estoquesolicitado)
        session.commit()

        return {"mensagem":"Essa solicitacao de estoque foi criada com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(session, e)
#endregion

#region FUNCAO DE LER ESTOQUE SOLICITADO
def ler_estoque_solicitado(session):
    return session.query(EstoqueSolicitacaoModel).all()

def ler_estoque_solicitado_id(session, id):
    return session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.id == id).first()
#endregion

#region FUNCAO DE ATUALIZAR ESTOQUE SOLICITADO
def atualizar_estoque_solicitado(session, id, dados_new):
    # verifica se existe
    existe_old = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.id == id).first()
    existe_new = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.estoque_id == dados_new.estoque_id,
                                                               EstoqueSolicitacaoModel.solicitacao_id == dados_new.solicitacao_id).first()
    if not existe_old:
        raise ErroEstoqueSolicitadoNaoEncontrado(session)

    if existe_new:
        raise ErroEstoqueSolicitadoExiste(session)

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.estoque_id = dados_new.estoque_id
        existe_old.solicitacao_id = dados_new.solicitacao_id

        # atualiza a alteracao no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Essa solicitacao de estoque foi atualizada com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(session, e)
#endregion

#region FUNCAO DE EXCLUIR ESTOQUE SOLICITADO
def excluir_estoque_solicitado(session, id):
    # verifica se existe
    existe = session.query(EstoqueSolicitacaoModel).filter(EstoqueSolicitacaoModel.id == id).first()
    if not existe:
        raise ErroEstoqueSolicitadoNaoEncontrado(session)

    # tratamento de erros
    try:
        # exclui o objeto do banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Essa solicitacao de estoque foi excluida com sucesso!!"}

    except Exception as e:
        raise ErroInesperado(session, e)
#endregion