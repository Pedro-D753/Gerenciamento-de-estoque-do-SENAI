from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_geral, jwt_admin, jwt_estoquista
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
async def pega_solicitacao(id_usuario: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as solicitacaos criadas  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler solicitacao", id=id_usuario, tb_acao="Solicitacao")

    return solicitacao.ler_solicitacao(session, id_usuario)

@router.get("/{id}")
async def pega_solicitacao_id(id: int, id_usuario: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a solicitacao criada com base no id  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler solicitacao pelo id", id=id_usuario, tb_acao="Solicitacao")

    return solicitacao.ler_solicitacao_id(session, id, id_usuario)

@router.post("/")
async def criar_solicitacao(base: BaseSolicitacao.SolicitacaoSchema, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Criar solicitacao \
    \n Essa rota exige um usuário autenticado."""
    log.criar_log(session=session, acao="Solicitacao criada", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.criar_solicitacao(session, base)

@router.post("/lote")
async def criar_solicitacoes(
    bases: list[BaseSolicitacao.SolicitacaoSchema],
    _id_user_acao: int = Depends(jwt_geral),
    session: Session = Depends(get_sesion),
):
    if not bases:
        raise HTTPException(status_code=422, detail="Informe pelo menos uma solicitação.")

    log.criar_log(
        session=session,
        acao=f"Criar lote com {len(bases)} solicitação(ões)",
        id=_id_user_acao,
        tb_acao="Solicitacao",
    )
    return solicitacao.criar_solicitacoes(session, bases)

@router.delete("/{id}")
async def delete_solicitacao(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o solicitacao \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Solicitacao deletada: {id}", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.excluir_solicitacao(session, id)

@router.patch("/{id}")
async def atualizar_solicitacao(id: int, base: BaseSolicitacao.SolicitacaoUpdateSchema, _id_user_acao: int = Depends(jwt_estoquista), session: Session = Depends(get_sesion)):
    """Atualiza somente campos sem alteração do fluxo de atendimento."""
    campos_permitidos = {"obs_solicita", "solicitante", "dt_solicitacao"}
    if base.model_fields_set - campos_permitidos:
        raise HTTPException(
            status_code=422,
            detail="Use as rotas específicas para recusar, separar ou registrar a retirada da solicitação.",
        )

    log.criar_log(session=session, acao=f"Solicitacao alterada: {id}", id=_id_user_acao, tb_acao="Solicitacao")

    return solicitacao.atualizar_solicitacao(session,id , base)


@router.patch("/master/{id}/recusar")
async def recusar_solicitacao_master(
    id: int,
    base: BaseSolicitacao.SolicitacaoRecusaSchema,
    _id_user_acao: int = Depends(jwt_admin),
    session: Session = Depends(get_sesion),
):
    log.criar_log(session=session, acao=f"Solicitação recusada pelo Master: {id}", id=_id_user_acao, tb_acao="Solicitacao")
    return solicitacao.recusar_solicitacao(session, id, base)


@router.patch("/estoquista/{id}/recusar")
async def recusar_solicitacao_estoquista(
    id: int,
    base: BaseSolicitacao.SolicitacaoRecusaSchema,
    _id_user_acao: int = Depends(jwt_estoquista),
    session: Session = Depends(get_sesion),
):
    log.criar_log(session=session, acao=f"Solicitação recusada pelo Estoquista: {id}", id=_id_user_acao, tb_acao="Solicitacao")
    return solicitacao.recusar_solicitacao(session, id, base, _id_user_acao)


@router.patch("/estoquista/{id}/separar")
async def separar_solicitacao_estoquista(
    id: int,
    _id_user_acao: int = Depends(jwt_estoquista),
    session: Session = Depends(get_sesion),
):
    log.criar_log(session=session, acao=f"Solicitação separada no estoque: {id}", id=_id_user_acao, tb_acao="Solicitacao")
    return solicitacao.separar_solicitacao(session, id, _id_user_acao)


@router.patch("/estoquista/{id}/retirar")
async def retirar_solicitacao_estoquista(
    id: int,
    _id_user_acao: int = Depends(jwt_estoquista),
    session: Session = Depends(get_sesion),
):
    log.criar_log(session=session, acao=f"Retirada de solicitação registrada: {id}", id=_id_user_acao, tb_acao="Solicitacao")
    return solicitacao.retirar_solicitacao(session, id, _id_user_acao)
