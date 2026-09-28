from ..models.registro import RegistroModel
from .erros import ErroInesperado, ErroRegistroExiste, ErroRegistroNaoEncontrado

#region FUNCAO CRIAR REGISTRO
def criar_registro(session, dados):
    # verifica se esse registro já existe
    existe = session.query(RegistroModel).filter(RegistroModel.is_saida == dados.is_saida,
                                                 RegistroModel.descricao == dados.descricao,
                                                 RegistroModel.qtd == dados.qtd,
                                                 RegistroModel.dt_registro == dados.dt_registro,
                                                 RegistroModel.estoque_id == dados.estoque_id).first()
    if existe:
        raise ErroRegistroExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto
        registro = RegistroModel(dados.descricao, dados.qtd, dados.dt_registro, dados.estoque_id, dados.is_saida)

        # adiciona o objeto no banco e salva
        session.add(registro)
        session.commit()

        return {"mensagem":"Registro criada com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER REGISTRO
def ler_registro(session):
    return session.query(RegistroModel).all()

def ler_registro(session, id):
    return session.query(RegistroModel).filter(RegistroModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR REGISTRO
def atualizar_registro(session, dados_old, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(RegistroModel).filter(RegistroModel.is_saida == dados_old.is_saida,
                                                    RegistroModel.descricao == dados_old.descricao,
                                                    RegistroModel.qtd == dados_old.qtd,
                                                    RegistroModel.dt_registro == dados_old.dt_registro,
                                                    RegistroModel.estoque_id == dados_old.estoque_id).first()
    
    existe_new = session.query(RegistroModel).filter(RegistroModel.is_saida == dados_new.is_saida,
                                                    RegistroModel.descricao == dados_new.descricao,
                                                    RegistroModel.qtd == dados_new.qtd,
                                                    RegistroModel.dt_registro == dados_new.dt_registro,
                                                    RegistroModel.estoque_id == dados_new.estoque_id).first()
    
    # se os dados antigos do registro nao existir
    if not existe_old:
        raise ErroRegistroNaoEncontrado(session)
    
    # se os dados novos já existirem em outro registro
    if existe_new:
        raise ErroRegistroExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto
        existe_old.nome == dados_new.nome

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Categoria atualizada com sucesso!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion
       
#region FUNCAO EXCLUIR REGISTRO
def excluir_registro(session, id):
    # verifica se existe esse registro no banco
    existe = session.query(RegistroModel).filter(RegistroModel.id == id).first()
    if not existe:
        raise ErroRegistroNaoEncontrado(session)
    
    # tratamento de erro
    try:
        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Registro foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion