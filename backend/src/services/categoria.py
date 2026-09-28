from ..models.categoria import CategoriaModel
from .erros import ErroInesperado, ErroCategoriaExiste, ErroCategoriaNaoEncontrado

#region FUNCAO CRIAR CATEGORIA
def criar_categoria(session, dados):
    # verifica se essa categoria já existe
    existe = session.query(CategoriaModel).filter(CategoriaModel.nome == dados.nome).first()
    if existe:
        raise ErroCategoriaExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto categoria
        categoria = CategoriaModel(dados.nome)

        # adiciona o objeto no banco e salva
        session.add(categoria)
        session.commit()

        return {"mensagem":"Categoria criada com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER CATEGORIA
def ler_categoria(session):
    return session.query(CategoriaModel).all()

def ler_categoria(session, id):
    return session.query(CategoriaModel).filter(CategoriaModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR CATEGORIA
def atualizar_categoria(session, dados_old, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(CategoriaModel).filter(CategoriaModel.nome == dados_old.nome).first()
    existe_new = session.query(CategoriaModel).filter(CategoriaModel.nome == dados_new.nome).first()

    # se os dados antigos da categoria nao existir
    if not existe_old:
        raise ErroCategoriaNaoEncontrado(session)
    
    # se os dados novos já existirem em outra categoria
    if existe_new:
        raise ErroCategoriaExiste(session)
    
    # tratamento de erro
    try:
        # cria o objeto categoria
        existe_old.nome == dados_new.nome

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Categoria atualizada com sucesso!"}

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion
       
#region FUNCAO EXCLUIR CATEGORIA
def excluir_categoria(session, id):
    # verifica se existe essa categoria no banco
    existe = session.query(CategoriaModel).filter(CategoriaModel.id == id).first()
    if not existe:
        raise ErroCategoriaNaoEncontrado(session)
    
    # tratamento de erro
    try:
        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"A categoria foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion