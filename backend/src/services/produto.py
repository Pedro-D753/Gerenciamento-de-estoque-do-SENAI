from ..models.produto import ProdutoModel
from ..models.estoque import EstoqueModel
from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from ..models.solicitacao import SolicitacaoModel, SolicitacaoTipoEnum
from ..models.user import UserModel
from .erros import ErroProdutoExiste, ErroProdutoNaoEncontrado, ErroInesperado
from fastapi import HTTPException
from datetime import datetime, timezone

#region FUNCAO CRIAR PRODUTO
def criar_produto(session, dados):
    codigo_barra = str(dados.codigo_barra)
    img_hash = None

    # verifica se existe
    existe = session.query(ProdutoModel).filter(ProdutoModel.nome == dados.nome,
                                                ProdutoModel.descricao == dados.descricao,
                                                ProdutoModel.img_hash == img_hash,
                                                ProdutoModel.unidade_medida == dados.unidade_medida,
                                                ProdutoModel.codigo_barra == codigo_barra,
                                                ProdutoModel.categoria_id == dados.categoria_id).first()

    if existe:
        raise ErroProdutoExiste(session)

    # tratamento de erros
    try:
        # cria o objeto
        produto = ProdutoModel(dados.nome, dados.descricao, img_hash, dados.unidade_medida, codigo_barra, dados.categoria_id)

        # adiciona no banco e salva
        session.add(produto)
        session.commit()

        return {
            "mensagem": "Produto criado com sucesso!!",
            "id": produto.id,
        }
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER PRODUTO
def ler_produto(session):
    return session.query(ProdutoModel).all()

def ler_produto_id(session, id):
    return session.query(ProdutoModel).filter(ProdutoModel.id == id).first()
#endregion

def atualizar_produto_estoquista(session, id, id_usuario, dados):
    produto = session.query(ProdutoModel).filter(ProdutoModel.id == id).first()
    estoque = (
        session.query(EstoqueModel)
        .join(UserModel, UserModel.unidade_id == EstoqueModel.unidade_id)
        .filter(
            EstoqueModel.produto_id == id,
            UserModel.id == id_usuario,
            EstoqueModel.is_excluido.is_(False),
        )
        .with_for_update()
        .first()
    )
    if produto is None or estoque is None:
        raise HTTPException(status_code=404, detail="Item não encontrado nesta unidade.")

    codigo_barra = str(dados.codigo_barra)
    codigo_existente = (
        session.query(ProdutoModel)
        .filter(ProdutoModel.codigo_barra == codigo_barra, ProdutoModel.id != id)
        .first()
    )
    if codigo_existente:
        raise HTTPException(status_code=409, detail="Já existe um item com este código de barras.")

    try:
        produto.nome = dados.nome
        produto.descricao = dados.descricao
        produto.unidade_medida = dados.unidade_medida
        produto.codigo_barra = codigo_barra
        produto.categoria_id = dados.categoria_id
        estoque.qtd = dados.qtd
        estoque.qtd_minima = dados.qtd_minima
        estoque.preco_unitario = dados.preco_unitario
        estoque.is_ativo = dados.is_ativo
        estoque.dt_validade = dados.dt_validade
        session.commit()
        return {"mensagem": "Item e estoque atualizados com sucesso."}
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)

#region FUNCAO ATUALIZAR PRODUTO
def atualizar_produto(session, id, dados_new):
    codigo_barra = (
        str(dados_new.codigo_barra)
        if dados_new.codigo_barra is not None
        else None
    )

    # verifica se existe
    existe_old = session.query(ProdutoModel).filter(ProdutoModel.id == id).first()
    existe_new = session.query(ProdutoModel).filter(ProdutoModel.nome == dados_new.nome,
                                                    ProdutoModel.descricao == dados_new.descricao,
                                                    ProdutoModel.img_hash == dados_new.img_hash,
                                                    ProdutoModel.unidade_medida == dados_new.unidade_medida,
                                                    ProdutoModel.codigo_barra == codigo_barra,
                                                    ProdutoModel.categoria_id == dados_new.categoria_id).first()

    if not existe_old:
        raise ErroProdutoNaoEncontrado(session)

    if existe_new:
        raise ErroProdutoExiste(session)

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.nome = dados_new.nome
        existe_old.descricao = dados_new.descricao
        existe_old.img_hash = dados_new.img_hash
        existe_old.unidade_medida = dados_new.unidade_medida
        if codigo_barra is not None:
            existe_old.codigo_barra = codigo_barra
        existe_old.categoria_id = dados_new.categoria_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Produto atualizado com sucesso!!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR PRODUTO
def excluir_produto(session, id):
    # verifica se existe
    existe = session.query(ProdutoModel).filter(ProdutoModel.id == id).first()

    if not existe:
        raise ErroProdutoNaoEncontrado(session)

    # tratamento de erros
    try:
        # deleta o objeto e salva as alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem":"Produto excluido com sucesso!!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion


def excluir_produto_estoquista(session, id, id_usuario, motivo_exclusao):
    try:
        usuario = session.query(UserModel).filter(UserModel.id == id_usuario).first()
        if usuario is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        estoque = (
            session.query(EstoqueModel)
            .filter(
                EstoqueModel.produto_id == id,
                EstoqueModel.unidade_id == usuario.unidade_id,
                EstoqueModel.is_excluido.is_(False),
            )
            .with_for_update()
            .first()
        )
        if estoque is None:
            raise HTTPException(status_code=404, detail="Item não encontrado nesta unidade.")

        solicitacao_em_aberto = (
            session.query(EstoqueSolicitacaoModel.id)
            .join(
                SolicitacaoModel,
                SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id,
            )
            .filter(EstoqueSolicitacaoModel.estoque_id == estoque.id)
            .filter(
                SolicitacaoModel.tipo.in_(
                    [SolicitacaoTipoEnum.EmAndamento, SolicitacaoTipoEnum.Separada]
                )
            )
            .first()
        )
        if solicitacao_em_aberto:
            raise HTTPException(
                status_code=409,
                detail="Não é possível excluir este item enquanto houver uma solicitação em andamento ou aguardando retirada.",
            )

        motivo_exclusao = motivo_exclusao.strip()
        if not motivo_exclusao:
            raise HTTPException(status_code=422, detail="Informe o motivo da exclusão.")

        estoque.is_excluido = True
        estoque.motivo_exclusao = motivo_exclusao
        estoque.dt_exclusao = datetime.now(timezone.utc)
        session.commit()
        return {"mensagem": "Item excluído do estoque desta unidade com sucesso."}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        raise ErroInesperado(e, session)
