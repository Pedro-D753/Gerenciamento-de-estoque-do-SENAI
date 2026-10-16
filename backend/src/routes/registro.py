from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import registro
from ..schemas import registro as BaseRegistro

router = APIRouter(
    prefix='/registros',
    tags=["Registro"],

    responses={
        404:{"description":"Essa registro não foi encontrado."}
    }
)

@router.get("/")
async def pega_registro(session: Session = Depends(get_sesion)):
    """\n Pegas todas as registros criadas"""
    return registro.ler_registro(session)


@router.get("/{id}")
async def pega_registro_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a registro criada com base no id"""
    return registro.ler_registro_id(session, id)

@router.post("/")
async def criar_registro(base: BaseRegistro.RegistroSchema, session: Session = Depends(get_sesion)):
    """\n Criar registro"""
    return registro.criar_registro(session, base)

@router.delete("/{id}")
async def delete_registro(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o registro"""
    return registro.excluir_registro(session, id)

@router.patch("/{id}")
async def atualizar_registro(id: int, base: BaseRegistro.RegistroUpdateSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar registro"""

    return registro.atualizar_registro(session, id, base)


