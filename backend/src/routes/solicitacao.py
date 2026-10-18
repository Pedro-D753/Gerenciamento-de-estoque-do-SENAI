from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_geral, jwt_admin
from ..services import solicitacao, log
from ..schemas import solicitacao as BaseSolicitacao

router = APIRouter(
    prefix='/solicitacaos',
    tags=["Solicitacao"],

    responses={
        404:{"description":"Essa solicitacao não foi encontrado."}
    }
)

@router.get("/")
async def pega_solicitacao(_id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as solicitacaos criadas  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler solicitacao", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.ler_solicitacao(session)

@router.get("/{id}")
async def pega_solicitacao_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a solicitacao criada com base no id  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler solicitacao pelo id", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.ler_solicitacao_id(session, id)

@router.post("/")
async def criar_solicitacao(base: BaseSolicitacao.SolicitacaoSchema, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Criar solicitacao \
    \n Essa rota exige um usuário autenticado."""
    log.criar_log(session=session, acao="Solicitacao criada", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.criar_solicitacao(session, base)

@router.delete("/{id}")
async def delete_solicitacao(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o solicitacao \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Solicitacao deletada: {id}", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.excluir_solicitacao(session, id)

@router.patch("/{id}")
async def atualizar_solicitacao(id: int, base: BaseSolicitacao.SolicitacaoUpdateSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar solicitacao \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"Solicitacao alterada: {id}", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.atualizar_solicitacao(session,id , base)
