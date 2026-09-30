from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
from ..services import user
from ..schemas import user as BaseUser

router = APIRouter(
    prefix='/users',
    tags=["User"],

    responses={
        404:{"description":"Essa user não foi encontrado."}
    }
)

@router.get("/")
async def pega_user(session: Session = Depends(get_sesion)):
    """\n Pegas todas as users criadas"""
    return user.ler_usuario(session)


@router.get("/{id}")
async def pega_user_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a user criada com base no id"""
    return user.ler_usuario_id(session, id)

@router.post("/")
async def criar_user(base: BaseUser.UserSchema, session: Session = Depends(get_sesion)):
    """\n Criar user"""
    return user.criar_usuario(session, base)

@router.delete("/{id}")
async def delete_user(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o user"""
    return user.excluir_usuario(session, id)

@router.patch("/{id}")
async def atualizar_user(id: int, base: BaseUser.UserUpdateSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar user"""

    return user.atualizar_usuario(session,id , base)


