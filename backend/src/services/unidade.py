from ..models.unidade import UnidadeModel
from .erros import ErroInesperado, ErroUnidadeExiste, ErroUnidadeNaoEncontrado

#region FUNCAO CRIAR UNIDADE
def criar_unidade(session, dados):
    # verifica se essa unidade já existe
    existe = session.query(UnidadeModel).filter(UnidadeModel.nome == dados.nome).first()
    if existe:
        raise ErroUnidadeExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto categoria
        unidade = UnidadeModel(dados.nome)

        # adiciona o objeto no banco e salva
        session.add(unidade)
        session.commit()

        return {"mensagem":"Unidade criada com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER UNIDADE
def ler_unidade(session):
    return session.query(UnidadeModel).all()

def ler_unidade(session, id):
    return session.query(UnidadeModel).filter(UnidadeModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR UNIDADE
def atualizar_unidade(session, dados_old, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(UnidadeModel).filter(UnidadeModel.nome == dados_old.nome).first()
    existe_new = session.query(UnidadeModel).filter(UnidadeModel.nome == dados_new.nome).first()

    # se os dados antigos da unidade nao existir
    if not existe_old:
        raise ErroUnidadeNaoEncontrado(session)
    
    # se os dados novos já existirem em outra unidade
    if existe_new:
        raise ErroUnidadeExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto categoria
        existe_old.nome = dados_new.nome

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Categoria atualizada com sucesso!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion
       
#region FUNCAO EXCLUIR UNIDADE
def excluir_unidade(session, id):
    # verifica se existe essa unidade no banco
    existe = session.query(UnidadeModel).filter(UnidadeModel.id == id).first()
    if not existe:
        raise ErroUnidadeNaoEncontrado(session)
    
    # tratamento de erro
    try:
        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Unidade foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion