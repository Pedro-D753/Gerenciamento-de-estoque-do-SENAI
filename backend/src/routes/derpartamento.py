from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import departamento
from ..schemas import departamento as BaseDepartamento

router = APIRouter(
    prefix='/departamentos',
    tags=["Departamento"],

    responses={
        404:{"description":"Essa departamento não foi encontrado."}
    }
)

@router.get("/")
async def pega_departamento(session: Session = Depends(get_sesion)):
    """\n Pegas todas as departamentos criadas"""
    return departamento.ler_departamento(session)


@router.get("/{id}")
async def pega_departamento_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a departamento criada com base no id"""
    return departamento.ler_departamento_id(session, id)

@router.post("/")
async def criar_departamento(base: BaseDepartamento.DepartamentoSchema, session: Session = Depends(get_sesion)):
    """\n Criar departamento"""
    return departamento.criar_departamento(session, base)

@router.delete("/{id}")
async def delete_departamento(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o departamento"""
    return departamento.excluir_departamento(session, id)

@router.patch("/{id}")
async def atualizar_departamento(id: int, base: BaseDepartamento.DepartamentoSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar departamento"""

    return departamento.atualizar_departamento(session,id , base)


