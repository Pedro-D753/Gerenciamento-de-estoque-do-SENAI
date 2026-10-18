from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
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

@router.get("/enviar_email_reste_senha/{Email}")
async def enviar_email_reste_senha(Email: str, session: Session = Depends(get_sesion)):

    return await email.enviar_email(email=Email, session=session)


@router.post("/confirme_email_reste_senha/{jwt}")
async def confirme_email_reste_senha(jwt: str, Base: BaseUser.UserResteSenhaSchema ,session: Session = Depends(get_sesion)):

    return email.verificar_email_senha(jwt, Base.senha, session)