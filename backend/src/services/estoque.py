from ..models.estoque import EstoqueModel
from ..models.produto import ProdutoModel
from ..models.unidade import UnidadeModel
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
                                                EstoqueModel.produto_id == dados.produto_id,
                                                EstoqueModel.unidade_id == dados.unidade_id).first()

    if existe:
        raise ErroEstoqueExiste(session)

    # tratamento de erros
    try:
        # cria objeto
        estoque = EstoqueModel(dados.qtd, dados.qtd_minima, dados.preco_unitario, dados.is_ativo, dados.localidade, dados.dt_validade, dados.produto_id, dados.unidade_id)

        # salva no banco
        session.add(estoque)
        session.commit()

        return {"mensagem":"Estoque criado com sucesso!!", "id": estoque.id}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER ESTOQUE
def ler_estoque(session):
    return session.query(EstoqueModel).filter(EstoqueModel.is_excluido.is_(False)).all()

def ler_estoque_id(session, id):
    return (
        session.query(EstoqueModel)
        .filter(EstoqueModel.id == id, EstoqueModel.is_excluido.is_(False))
        .first()
    )


def ler_estoques_excluidos(session):
    registros = (
        session.query(EstoqueModel, ProdutoModel, UnidadeModel)
        .join(ProdutoModel, ProdutoModel.id == EstoqueModel.produto_id)
        .join(UnidadeModel, UnidadeModel.id == EstoqueModel.unidade_id)
        .filter(EstoqueModel.is_excluido.is_(True))
        .order_by(EstoqueModel.dt_exclusao.desc().nullslast(), EstoqueModel.id.desc())
        .all()
    )
    return [
        {
            "id": estoque.id,
            "produto_id": produto.id,
            "produto_nome": produto.nome,
            "produto_codigo": produto.codigo_barra,
            "categoria_id": produto.categoria_id,
            "unidade_id": unidade.id,
            "unidade_nome": unidade.nome,
            "motivo_exclusao": estoque.motivo_exclusao,
            "dt_exclusao": estoque.dt_exclusao,
        }
        for estoque, produto, unidade in registros
    ]
#endregion

#region FUNCAO ATUALIZAR ESTOQUE
def atualizar_estoque(session, id , dados_new):
    # verifica se existe
    existe_old = session.query(EstoqueModel).filter(EstoqueModel.id == id).first()
    existe_new = session.query(EstoqueModel).filter(EstoqueModel.qtd == dados_new.qtd,
                                                EstoqueModel.qtd_minima == dados_new.qtd_minima,
                                                EstoqueModel.preco_unitario == dados_new.preco_unitario,
                                                EstoqueModel.is_ativo == dados_new.is_ativo,
                                                EstoqueModel.localidade == dados_new.localidade,
                                                EstoqueModel.dt_validade == dados_new.dt_validade,
                                                EstoqueModel.produto_id == dados_new.produto_id,
                                                EstoqueModel.unidade_id == dados_new.unidade_id).first()

    if not existe_old:
        raise ErroEstoqueNaoEncontrado(session)

    if existe_new:
        raise ErroEstoqueExiste(session)

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.qtd = dados_new.qtd
        existe_old.qtd_minima = dados_new.qtd_minima
        existe_old.preco_unitario = dados_new.preco_unitario
        existe_old.is_ativo = dados_new.is_ativo
        existe_old.localidade = dados_new.localidade
        existe_old.dt_validade = dados_new.dt_validade
        existe_old.produto_id = dados_new.produto_id
        existe_old.unidade_id = dados_new.unidade_id

        # atualiza o banco e salva as alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Estoque atualizado com sucesso!!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR ESTOQUE
def excluir_estoque(session, id):
    # verifica se existe
    existe = session.query(EstoqueModel).filter(EstoqueModel.id == id).first()

    if not existe: 
        raise ErroEstoqueNaoEncontrado(session)
    
    #tratamento de dados
    try:
        # deleta objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Estoque excluido com sucesso!!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion