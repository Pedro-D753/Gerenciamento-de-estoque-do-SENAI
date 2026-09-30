from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import estoque
from ..schemas import estoque as BaseEstoque

router = APIRouter(
    prefix='/estoques',
    tags=["Estoque"],

    responses={
        404:{"description":"Essa estoque não foi encontrado."}
    }
)

@router.get("/")
async def pega_estoque(session: Session = Depends(get_sesion)):
    """\n Pegas todas as estoques criadas"""
    return estoque.ler_estoque(session)


@router.get("/{id}")
async def pega_estoque_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a estoque criada com base no id"""
    return estoque.ler_estoque_id(session, id)

@router.post("/")
async def criar_estoque(base: BaseEstoque.EstoqueSchema, session: Session = Depends(get_sesion)):
    """\n Criar estoque"""
    return estoque.criar_estoque(session, base)

@router.delete("/{id}")
async def delete_estoque(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o estoque"""
    return estoque.excluir_estoque(session, id)

@router.patch("/{id}")
async def atualizar_estoque(id: int, base: BaseEstoque.EstoqueUpdateSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar estoque"""

    return estoque.atualizar_estoque(session,id , base)


