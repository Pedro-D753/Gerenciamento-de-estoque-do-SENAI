from fastapi import APIRouter, Depends
from ..dependencies import get_sesion
from sqlalchemy.orm import Session
from ..services import categoria

router = APIRouter(
    "/Categoria", 
    tags=["Categoria"],

    responses={
        
    }
)


@router.get("/")
async def pega_categoria(session: Session = Depends(get_sesion)):
    """\n Pegas todas as categorias criadas"""
    return categoria.ler_categoria()