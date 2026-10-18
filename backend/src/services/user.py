from ..models.user import UserModel
from passlib.hash import sha256_crypt as sha256
from .erros import ErroInesperado, ErroUserExiste, ErroUserNaoEncontrado
from ..config import SECRET_KEY, ALG, TIMER_ACCESS, TIMER_REFRESH
from jose import jwt
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlalchemy.exc import IntegrityError

#region FUNCAO CRIAR USUARIO
def criar_usuario(session, dados):
    # verifica se existe esse usuario no banco
    existe = session.query(UserModel).filter(
        UserModel.matricula == dados.matricula
    ).first()
    if existe:
        raise ErroUserExiste(session)

    # tratamento de erros
    try:
        # cria o objeto usuario
        usuario = UserModel(dados.nome, dados.email, dados.senha, dados.matricula, dados.unidade_id, dados.is_admin, dados.is_ativo)

        # adiciona o objeto no banco e salva
        session.add(usuario)
        session.commit()

        return {"mensagem":"Usuario criado com sucesso!"}

    except IntegrityError as e:
        raise ErroUserExiste(session)
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER USUARIO
def ler_usuario(session):
    return session.query(UserModel).all()

def ler_usuario_id(session, id):
    return session.query(UserModel).filter(UserModel.id == id).first()
#endregion

#region FUNCAO JWT
def criar_token(id_user: int, is_admin : bool= False, refresh_token : bool = False, is_reste_senha: bool = False):
    try:

        dt_expi : datetime

        if refresh_token == False:
            dt_expi = datetime.now(timezone.utc) + TIMER_ACCESS
        else:
            dt_expi = datetime.now(timezone.utc) + TIMER_REFRESH

        #O dic_info está configurado com base no padrão JWT: https://www.jwt.io/
        dic_info = {
            'sub': str(id_user),
            'exp': dt_expi, 
            "is_admin" : is_admin,
            "is_reste_senha": is_reste_senha,
            "jit": str(uuid4())
            }
        
        #Cria o JWT
        jwt_codificado = jwt.encode(dic_info, SECRET_KEY, ALG)#type: ignore
        return jwt_codificado
    
    except Exception as e:
        raise ErroInesperado(e)

def autenticar(session, dados):
    # verifica se existe
    existe = session.query(UserModel).filter(UserModel.matricula == dados.matricula).first()

    if not existe:
        raise ErroUserNaoEncontrado(session)

    if not existe.verificarSenha(dados.senha):
        raise ErroUserNaoEncontrado(session)

    print(existe.verificarSenha(dados.senha))

    
    access_token = criar_token(existe.id, existe.is_admin)
    refresh_token = criar_token(existe.id, existe.is_admin, True)

    return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        }
#endregion

#region FUNCAO ATUALIZAR USUARIO 
def atualizar_usuario(session, id, dados_new):
    # verifica se existe
    existe_old = session.query(UserModel).filter(UserModel.id == id).first()
    existe_new = session.query(UserModel).filter(
        UserModel.matricula == dados_new.matricula,
        UserModel.id != id,
    ).first()
    if not existe_old:
        raise ErroUserNaoEncontrado(session)

    if existe_new:
        raise ErroUserExiste(session)

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.nome = dados_new.nome
        existe_old.email = dados_new.email
        existe_old.senha = dados_new.senha
        existe_old.matricula = dados_new.matricula
        existe_old.is_admin = dados_new.is_admin
        existe_old.is_ativo = dados_new.is_ativo
        existe_old.unidade_id = dados_new.unidade_id

        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Usuario atualizado com sucesso!!"}

    except IntegrityError as e:
        raise ErroUserExiste(session)
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR USUARIO
def excluir_usuario(session, id):
    # verifica se esse usuario existe
    existe = session.query(UserModel).filter(UserModel.id == id).first()
    if not existe:
        raise ErroUserNaoEncontrado(session)

    # tratamento de erro
    try:
        # exclui o usuario e salva as alteracoes no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"O usuario foi excluido com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion