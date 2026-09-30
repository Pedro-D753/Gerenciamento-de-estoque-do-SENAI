from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import categoria
from ..schemas import categoria as BaseCartegoria

router = APIRouter(
    prefix='/categoria',
    tags=["Categoria"],

    responses={
        404:{"description":"Essa categoria não foi encontrado."}
    }
)


@router.get("/")
async def pega_categoria(session: Session = Depends(get_sesion)):
    """\n Pegas todas as categorias criadas"""
    return categoria.ler_categoria(session)


@router.get("/{id}")
async def pega_categoria_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a categoria criada com base no id"""
    return categoria.ler_categoria_id(session, id)

@router.post("/")
async def criar_Categoria(base: BaseCartegoria.CategoriaSchema, session: Session = Depends(get_sesion)):
    """\n Criar Categoria"""
    return categoria.criar_categoria(session, base)

@router.delete("/{id}")
async def delete_categoria(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar a categoria"""
    return categoria.excluir_categoria(session, id)

@router.patch("/{id}")
async def atualizar_categoria(id: int, base: BaseCartegoria.CategoriaSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar Categoria"""

    return categoria.atualizar_categoria(session,id , base)


