from ..models.produto import ProdutoModel
from .erros import ErroProdutoExiste, ErroProdutoNaoEncontrado, ErroInesperado

#region FUNCAO CRIAR PRODUTO
def criar_produto(session, dados):
    # verifica se existe
    existe = session.query(ProdutoModel).filter(ProdutoModel.nome == dados.nome,
                                                ProdutoModel.descricao == dados.descricao,
                                                ProdutoModel.img_hash == dados.img_hash,
                                                ProdutoModel.unidade_medida == dados.unidade_medida,
                                                ProdutoModel.codigo_barra == dados.codigo_barra,
                                                ProdutoModel.categoria_id == dados.categoria_id,
                                                ProdutoModel.departamento_id == dados.departamento_id).first()

    if existe:
        return ErroProdutoExiste(session)

    # tratamento de erros
    try:
        # cria o objeto
        produto = ProdutoModel(dados.nome, dados.descricao, dados.img_hash , dados.unidade_medida, dados.codigo_barra, dados.categoria_id, dados.departamento_id)

        # adiciona no banco e salva
        session.add(produto)
        session.commit()

        return {"mensagem":"Produto criado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO LER PRODUTO
def ler_produto(session):
    return session.query(ProdutoModel).all()

def ler_produto(session, id):
    return session.query(ProdutoModel).filter(ProdutoModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR PRODUTO
def atualizar_produto(session, dados_new, dados_old):
    # verifica se existe
    existe_old = session.query(ProdutoModel).filter(ProdutoModel.nome == dados_old.nome,
                                                    ProdutoModel.descricao == dados_old.descricao,
                                                    ProdutoModel.img_hash == dados_old.img_hash,
                                                    ProdutoModel.unidade_medida == dados_old.unidade_medida,
                                                    ProdutoModel.codigo_barra == dados_old.codigo_barra,
                                                    ProdutoModel.categoria_id == dados_old.categoria_id,
                                                    ProdutoModel.departamento_id == dados_old.departamento_id).first()
    existe_new = session.query(ProdutoModel).filter(ProdutoModel.nome == dados_new.nome,
                                                    ProdutoModel.descricao == dados_new.descricao,
                                                    ProdutoModel.img_hash == dados_new.img_hash,
                                                    ProdutoModel.unidade_medida == dados_new.unidade_medida,
                                                    ProdutoModel.codigo_barra == dados_new.codigo_barra,
                                                    ProdutoModel.categoria_id == dados_new.categoria_id,
                                                    ProdutoModel.departamento_id == dados_new.departamento_id).first()

    if not existe_old:
        return ErroProdutoNaoEncontrado(session)

    if existe_new:
        return ErroProdutoExiste(session)

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.nome = existe_new.nome
        existe_old.descricao = existe_new.descricao
        existe_old.img_hash = existe_new.img_hash
        existe_old.unidade_medida = existe_new.unidade_medida
        existe_old.codigo_barra = existe_new.codigo_barra
        existe_old.categoria_id = existe_new.categoria_id
        existe_old.departamento_id = existe_new.departamento_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Produto atualizado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR PRODUTO
def excluir_produto(session, id):
    # verifica se existe
    existe = session.query(ProdutoModel).filter(ProdutoModel.id == id).first()

    if not existe:
        return ErroProdutoNaoEncontrado(session)

    # tratamento de erros
    try:
        # deleta o objeto e salva as alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem":"Produto excluido com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion
