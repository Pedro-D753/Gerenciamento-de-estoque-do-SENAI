from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import user, log
from ..schemas import user as BaseUser

router = APIRouter(
    prefix='/users',
    tags=["User"],

    responses={
        404:{"description":"Essa user não foi encontrado."}
    }
)

@router.get("/")
async def pega_user(_id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Pegas todas as users criadas \
    \n Essa rota pertence somente ao admin."""
    
    log.criar_log(session=session, acao="ler usario", id=_id_user_acao, tb_acao="Usario")

    return user.ler_usuario(session)


@router.get("/{id}")
async def pega_user_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a user criada com base no id \
    \n Essa rota tem que está logado."""

    log.criar_log(session=session, acao="ler usario com base no id dele", id=_id_user_acao, tb_acao="Usario")

    return user.ler_usuario_id(session, id)

@router.post("/")
async def criar_user(base: BaseUser.UserSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar user \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"criar usuario: {base.nome}", id=_id_user_acao, tb_acao="Usario")

    return user.criar_usuario(session, base)

@router.delete("/{id}")
async def delete_user(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o user \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao="deletar o user", id=_id_user_acao, tb_acao="Usario")

    return user.excluir_usuario(session, id)

@router.patch("/{id}")
async def atualizar_user(id: int, base: BaseUser.UserUpdateSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar user \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"dados alterados do User {id}", id=_id_user_acao, tb_acao="Usario")

    return user.atualizar_usuario(session,id , base)

