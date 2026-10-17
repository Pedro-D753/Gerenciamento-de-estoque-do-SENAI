from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import produto
from ..schemas import produto as BaseProduto

router = APIRouter(
    prefix='/produtos',
    tags=["Produto"],

    responses={
        404:{"description":"Essa produto não foi encontrado."}
    }
)

@router.get("/")
async def pega_produto(_: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as produtos criadas"""
    return produto.ler_produto(session)


@router.get("/{id}")
async def pega_produto_id(id: int, _: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a produto criada com base no id"""
    return produto.ler_produto_id(session, id)

@router.post("/")
async def criar_produto(base: BaseProduto.ProdutoSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar produto"""
    return produto.criar_produto(session, base)

@router.delete("/{id}")
async def delete_produto(id: int, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o produto"""
    return produto.excluir_produto(session, id)

@router.patch("/{id}")
async def atualizar_produto(id: int, base: BaseProduto.ProdutoUpdateSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar produto"""

    return produto.atualizar_produto(session, id, base)

