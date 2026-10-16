from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
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
async def pega_registro(_: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as registros criadas \
    \n Essa rota tem que está logado."""
    return registro.ler_registro(session)


@router.get("/{id}")
async def pega_registro_id(id: int, _: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a registro criada com base no id \
    \n Essa rota tem que está logado."""
    return registro.ler_registro_id(session, id)

@router.post("/")
async def criar_registro(base: BaseRegistro.RegistroSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar registro  \
    \n Essa rota pertence somente ao admin."""
    return registro.criar_registro(session, base)

@router.delete("/{id}")
async def delete_registro(id: int, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o registro  \
    \n Essa rota pertence somente ao admin."""
    return registro.excluir_registro(session, id)

@router.patch("/{id}")
async def atualizar_registro(id: int, base: BaseRegistro.RegistroUpdateSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar registro  \
    \n Essa rota pertence somente ao admin."""

    return registro.atualizar_registro(session, id, base)

