from ..models.solicitacao import SolicitacaoModel
from .erros import ErroInesperado, ErroSolicitacaoExiste, ErroSolicitacaoNaoEncontrado

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
        solicitacao = SolicitacaoModel(dados.nome)

        # adiciona o objeto no banco e salva
        session.add(solicitacao)
        session.commit()

        return {"mensagem":"Solicitacao criada com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER SOLICITACAO
def ler_solicitacao(session):
    return session.query(SolicitacaoModel).all()

def ler_solicitacao(session, id):
    return session.query(SolicitacaoModel).filter(SolicitacaoModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR SOLICITACAO
def atualizar_solicitacao(session, dados_old, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados_old.is_aceito,
                                                        SolicitacaoModel.obs_solicita == dados_old.obs_solicita,
                                                        SolicitacaoModel.obs_recusa == dados_old.obs_recusa,
                                                        SolicitacaoModel.tipo == dados_old.tipo,
                                                        SolicitacaoModel.estado == dados_old.estado,
                                                        SolicitacaoModel.qtd_acao == dados_old.qtd_acao,
                                                        SolicitacaoModel.dt_acao == dados_old.dt_acao).first()
    
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
        existe_old.is_aceito = existe_new.is_aceito
        existe_old.obs_solicitacao = existe_new.obs_solicitacao
        existe_old.obs_recusa = existe_new.obs_recusa
        existe_old.tipo = existe_new.tipo
        existe_old.estado = existe_new.estado
        existe_old.qtd_acao = existe_new.qtd_acao
        existe_old.dt_acao = existe_new.dt_acao

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

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
        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Solicitacao foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion