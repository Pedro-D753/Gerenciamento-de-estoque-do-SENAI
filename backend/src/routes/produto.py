from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import produto, log
from ..schemas import produto as BaseProduto

router = APIRouter(
    prefix='/produtos',
    tags=["Produto"],

    responses={
        404:{"description":"Essa produto não foi encontrado."}
    }
)

@router.get("/")
async def pega_produto(_id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as produtos criadas \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler produto", id=_id_user_acao, tb_acao="Produto")

    return produto.ler_produto(session)


@router.get("/{id}")
async def pega_produto_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a produto criada com base no id \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler produto pelo id", id=_id_user_acao, tb_acao="Produto")

    return produto.ler_produto_id(session, id)

@router.post("/")
async def criar_produto(base: BaseProduto.ProdutoSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar produto \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Produto criado: {base.nome}", id=_id_user_acao, tb_acao="Produto")

    return produto.criar_produto(session, base)

@router.delete("/{id}")
async def delete_produto(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o produto \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Produto deletado: {id}", id=_id_user_acao, tb_acao="Produto")

    return produto.excluir_produto(session, id)

@router.patch("/{id}")
async def atualizar_produto(id: int, base: BaseProduto.ProdutoUpdateSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar produto \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"Produto alterado: {id}", id=_id_user_acao, tb_acao="Produto")

    return produto.atualizar_produto(session, id, base)
