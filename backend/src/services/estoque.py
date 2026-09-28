from ..models.estoque import EstoqueModel
from .erros import ErroEstoqueExiste, ErroEstoqueNaoEncontrado, ErroInesperado

#region FUNCAO CRIAR ESTOQUE
def criar_estoque(session, dados):
    # verifica se existe
    existe = session.query(EstoqueModel).filter(EstoqueModel.qtd == dados.qtd,
                                                EstoqueModel.qtd_minima == dados.qtd_minima,
                                                EstoqueModel.preco_unitario == dados.preco_unitario,
                                                EstoqueModel.is_ativo == dados.is_ativo,
                                                EstoqueModel.localidade == dados.localidade,
                                                EstoqueModel.dt_validade == dados.dt_validade,
                                                EstoqueModel.produto == dados.produto_id,
                                                EstoqueModel.unidade == dados.unidade_id).first()

    if existe:
        return ErroEstoqueExiste(session)

    # tratamento de erros
    try:
        # cria objeto
        estoque = EstoqueModel(dados.qtd, dados.qtd_minima, dados.preco_unitario, dados.is_ativo, dados.localidade, dados.dt_validade, dados.produto_id, dados.unidade_id)

        # salva no banco
        session.add(estoque)
        session.commit()

        return {"mensagem":"Estoque criado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO LER ESTOQUE
def ler_estoque(session):
    return session.query(EstoqueModel).all()

def ler_estoque(session, id):
    return session.query(EstoqueModel).filter(EstoqueModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR ESTOQUE
def atualizar_estoque(session, dados_old, dados_new):
    # verifica se existe
    existe_old = session.query(EstoqueModel).filter(EstoqueModel.qtd == dados_old.qtd,
                                                EstoqueModel.qtd_minima == dados_old.qtd_minima,
                                                EstoqueModel.preco_unitario == dados_old.preco_unitario,
                                                EstoqueModel.is_ativo == dados_old.is_ativo,
                                                EstoqueModel.localidade == dados_old.localidade,
                                                EstoqueModel.dt_validade == dados_old.dt_validade,
                                                EstoqueModel.produto == dados_old.produto_id,
                                                EstoqueModel.unidade == dados_old.unidade_id).first()
    existe_new = session.query(EstoqueModel).filter(EstoqueModel.qtd == dados_old.qtd,
                                                EstoqueModel.qtd_minima == dados_new.qtd_minima,
                                                EstoqueModel.preco_unitario == dados_new.preco_unitario,
                                                EstoqueModel.is_ativo == dados_new.is_ativo,
                                                EstoqueModel.localidade == dados_new.localidade,
                                                EstoqueModel.dt_validade == dados_new.dt_validade,
                                                EstoqueModel.produto == dados_new.produto_id,
                                                EstoqueModel.unidade == dados_new.unidade_id).first()

    if not existe_old:
        return ErroEstoqueNaoEncontrado(session)

    if existe_new:
        return ErroEstoqueExiste(session)

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.qtd = existe_new.qtd
        existe_old.qtd_minima = existe_new.qtd_minima
        existe_old.preco_unitario = existe_new.preco_unitario
        existe_old.is_ativo = existe_new.is_ativo
        existe_old.localidade = existe_new.localidade
        existe_old.dt_validade = existe_new.dt_validade
        existe_old.produto_id = existe_new.produto_id
        existe_old.unidade_id = existe_new.unidade_id

        # atualiza o banco e salva as alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Estoque atualizado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR ESTOQUE
def excluir_estoque(session, id):
    # verifica se existe
    existe = session.query(EstoqueModel).filter(EstoqueModel.id == id).first()

    if not existe: 
        return ErroEstoqueNaoEncontrado(session)
    
    #tratamento de dados
    try:
        # deleta objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Estoque excluido com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion