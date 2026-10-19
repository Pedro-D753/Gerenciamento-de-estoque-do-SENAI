from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_geral
from ..models.user import UserModel
from ..models.unidade import UnidadeModel
from ..services import user, email
from ..schemas import user as BaseUser

router = APIRouter(
    prefix='/auth',
    tags=["Auth", "User"],

    responses={
        404:{"description":"Essa user não foi encontrado."}
    }
)

@router.post("/login")
async def login_user(base: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_sesion)):
    '''\nRealiza o login do user e retorna um token JWT. \n \n \
    O username = matricula \n \n \
    O password = senha \n \n \
    '''

    _base = BaseUser.UserLoginSchema(matricula = base.username, senha = base.password)
    
    return user.autenticar(session, _base)


@router.get("/me")
async def usuario_autenticado(
    id_usuario: int = Depends(jwt_geral),
    session: Session = Depends(get_sesion),
):
    registro = (
        session.query(UserModel, UnidadeModel)
        .join(UnidadeModel, UserModel.unidade_id == UnidadeModel.id)
        .filter(UserModel.id == id_usuario)
        .first()
    )
    if registro is None:
        return {"id": id_usuario, "is_admin": False, "unidade": None}

    usuario, unidade = registro
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "is_admin": usuario.is_admin,
        "unidade": {"id": unidade.id, "nome": unidade.nome},
    }

@router.get("/enviar_email_reste_senha/{Email}")
async def enviar_email_reste_senha(Email: str, session: Session = Depends(get_sesion)):

    return await email.enviar_email(email=Email, session=session)


@router.post("/confirme_email_reste_senha/{jwt}")
async def confirme_email_reste_senha(jwt: str, Base: BaseUser.UserResteSenhaSchema ,session: Session = Depends(get_sesion)):

    return email.verificar_email_senha(jwt, Base.senha, session)