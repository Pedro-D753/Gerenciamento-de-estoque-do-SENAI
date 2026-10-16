from ..models.solicitacao import SolicitacaoModel
from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from .erros import ErroInesperado, ErroSolicitacaoExiste, ErroSolicitacaoNaoEncontrado
from .estoque_solicitado import criar_estoque_solicitado, atualizar_estoque_solicitado, excluir_estoque_solicitado


def _serializar_solicitacao(solicitacao, estoque_solicitado):
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
        },
        "estoque_solicitado": {
            "id": estoque_solicitado.id,
            "estoque_id": estoque_solicitado.estoque_id,
            "solicitacao_id": estoque_solicitado.solicitacao_id,
        },
    }

#region FUNCAO CRIAR SOLICITACAO
def criar_solicitacao(session, dados):
    # verifica se essa solicitacao já existe
    existe = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados.is_aceito,
                                                    SolicitacaoModel.obs_solicita == dados.obs_solicita,
                                                    SolicitacaoModel.obs_recusa == dados.obs_recusa,
                                                    SolicitacaoModel.email_solicitador_hash == dados.email_solicitador_hash,
                                                    SolicitacaoModel.tipo == dados.tipo,
                                                    SolicitacaoModel.estado == dados.estado,
                                                    SolicitacaoModel.qtd_acao == dados.qtd_acao,
                                                    SolicitacaoModel.dt_acao == dados.dt_acao).first()
    if existe:
        raise ErroSolicitacaoExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto solicitacao
        solicitacao = SolicitacaoModel(dados.is_aceito, dados.obs_solicita, dados.obs_recusa, dados.email_solicitador_hash, dados.tipo, dados.estado, dados.qtd_acao, dados.dt_acao)

        # adiciona o objeto no banco e salva
        session.add(solicitacao)

        criar_estoque_solicitado(session, dados)
        
        session.commit()


        return {"mensagem":"Solicitacao criada com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER SOLICITACAO
def ler_solicitacao(session):
    resultados = session.query(SolicitacaoModel, EstoqueSolicitacaoModel).join(EstoqueSolicitacaoModel, SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id).all()
    return [_serializar_solicitacao(solicitacao, estoque_solicitado) for solicitacao, estoque_solicitado in resultados]

def ler_solicitacao_id(session, id):
    resultado = session.query(SolicitacaoModel, EstoqueSolicitacaoModel).join(EstoqueSolicitacaoModel, SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id).filter(SolicitacaoModel.id == id).first()

    if not resultado:
        return None

    solicitacao, estoque_solicitado = resultado
    return _serializar_solicitacao(solicitacao, estoque_solicitado)
#endregion

#region FUNCAO ATUALIZAR SOLICITACAO
def atualizar_solicitacao(session, id, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(SolicitacaoModel).filter(SolicitacaoModel.id == id).first()
    
    existe_new = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados_new.is_aceito,
                                                        SolicitacaoModel.obs_solicita == dados_new.obs_solicita,
                                                        SolicitacaoModel.obs_recusa == dados_new.obs_recusa,
                                                        SolicitacaoModel.email_solicitador_hash == dados_new.email_solicitador_hash,
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
        existe_old.is_aceito = dados_new.is_aceito
        existe_old.obs_solicita = dados_new.obs_solicita
        existe_old.obs_recusa = dados_new.obs_recusa
        existe_old.email_solicitador_hash = dados_new.email_solicitador_hash
        existe_old.tipo = dados_new.tipo
        existe_old.estado = dados_new.estado
        existe_old.qtd_acao = dados_new.qtd_acao
        existe_old.dt_acao = dados_new.dt_acao

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

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