from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import contrato
from ..schemas import contrato as Basecontrato

router = APIRouter(
    prefix='/contratos',
    tags=["Contrato"],

    responses={
        404:{"description":"Essa contrato não foi encontrado."}
    }
)

@router.get("/")
async def pega_contrato(_: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as contratos criadas  \
    \n Essa rota tem que está logado."""
    return contrato.ler_contrato(session)


@router.get("/{id}")
async def pega_contrato_id(id: int, _: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a contrato criada com base no id  \
    \n Essa rota tem que está logado."""
    return contrato.ler_contrato_id(session, id)

@router.post("/")
async def criar_contrato(base: Basecontrato.ContratoSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar contrato \
    \n Essa rota pertence somente ao admin."""
    return contrato.criar_contrato(session, base)

@router.delete("/{id}")
async def delete_contrato(id: int, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o contrato \
    \n Essa rota pertence somente ao admin."""
    return contrato.excluir_contrato(session, id)

@router.patch("/{id}")
async def atualizar_contrato(id: int, base: Basecontrato.ContratoSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar contrato \
    \n Essa rota pertence somente ao admin."""

    return contrato.atualizar_contrato(session,id , base)

