from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import unidade
from ..schemas import unidade as BaseUnidade

router = APIRouter(
    prefix='/unidades',
    tags=["Unidade"],

    responses={
        404:{"description":"Essa unidade não foi encontrado."}
    }
)

@router.get("/")
async def pega_unidade(session: Session = Depends(get_sesion)):
    """\n Pegas todas as unidades criadas"""
    return unidade.ler_unidade(session)


@router.get("/{id}")
async def pega_unidade_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a unidade criada com base no id"""
    return unidade.ler_unidade_id(session, id)

@router.post("/")
async def criar_unidade(base: BaseUnidade.UnidadeSchema, session: Session = Depends(get_sesion)):
    """\n Criar unidade"""
    return unidade.criar_unidade(session, base)

@router.delete("/{id}")
async def delete_unidade(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o unidade"""
    return unidade.excluir_unidade(session, id)

@router.patch("/{id}")
async def atualizar_unidade(id: int, base: BaseUnidade.UnidadeSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar unidade"""

    return unidade.atualizar_unidade(session,id , base)


