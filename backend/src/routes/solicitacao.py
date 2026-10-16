from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_geral, jwt_admin
from ..services import solicitacao
from ..schemas import solicitacao as BaseSolicitacao

router = APIRouter(
    prefix='/solicitacaos',
    tags=["Solicitacao"],

    responses={
        404:{"description":"Essa solicitacao não foi encontrado."}
    }
)

@router.get("/")
async def pega_solicitacao(_: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as solicitacaos criadas  \
    \n Essa rota tem que está logado."""
    return solicitacao.ler_solicitacao(session)

@router.get("/{id}")
async def pega_solicitacao_id(id: int, _: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a solicitacao criada com base no id  \
    \n Essa rota tem que está logado."""
    return solicitacao.ler_solicitacao_id(session, id)

@router.post("/")
async def criar_solicitacao(base: BaseSolicitacao.SolicitacaoSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar solicitacao \
    \n Essa rota pertence somente ao admin."""
    return solicitacao.criar_solicitacao(session, base)

@router.delete("/{id}")
async def delete_solicitacao(id: int, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o solicitacao \
    \n Essa rota pertence somente ao admin."""
    return solicitacao.excluir_solicitacao(session, id)

@router.patch("/{id}")
async def atualizar_solicitacao(id: int, base: BaseSolicitacao.SolicitacaoUpdateSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar solicitacao \
    \n Essa rota pertence somente ao admin."""

    return solicitacao.atualizar_solicitacao(session,id , base)

