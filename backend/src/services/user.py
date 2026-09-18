from ..models.user import UserModel
from .erros import ErroInesperado, ErroUserExiste, ErroUserNaoEncontrado
from ..config import SECRETES_KEY, ALG, TIMER
from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timezone


# FUNCAO CRIAR USUARIO
def criar_usuario(session, dados):
    # verifica se existe esse usuario no banco
    existe = session.query(UserModel).filter(UserModel.nome == dados.nome, 
    UserModel.senha == dados.senha, 
    UserModel.matricula == dados.matricula, 
    UserModel.is_admin == dados.is_admin, 
    UserModel.is_ativo == dados.is_ativo, 
    UserModel.unidade_id == dados.unidade_id).first()
    if existe:
        raise ErroUserExiste(session)

    # tratamento de erros
    try:
        # cria o objeto usuario
        usuario = UserModel(dados.nome, dados.senha, dados.matricula, dados.unidade_id, dados.is_admin, dados.is_ativo)

        # adiciona o objeto no banco e salva
        session.add(usuario)
        session.commit()

        return {"mensagem":"Usuario criado com sucesso!"}

    except Exception as e:
        raise ErroInesperado(e, session)

# FUNCAO LER USUARIO
def ler_usuario(session):
    return session.query(UserModel).all()

def autenticar(session):
    ...

#fixe-me: como nós vamos resetar a senha ?
def criar_token(id_user: int, is_admin : bool= False):
    try:
        
        dt_expi = datetime.now(timezone.utc) + TIMER

        dic_info = None

        #O dic_info está configurado com base no padrão JWT: https://www.jwt.io/
        dic_info = {
                'sub': str(id_user),
                'exp': dt_expi, 
                "is_admin" : is_admin,
                }
        
        #Cria o JWT
        jwt_codificado = jwt.encode(dic_info, SECRETES_KEY, ALG)#type: ignore
        return jwt_codificado
    
    except Exception as e:
        raise ErroInesperado(e)

def refresh_token(id_user: int): 
    access_token = criar_token(id_user)

    return {
        "access_token": access_token,
        "token_type": "Bearer"
    }

# FUNCAO ATUALIZAR USUARIO
def atualizar_usuario(session, dados_old, dados_new):
    ...

# FUNCAO EXCLUIR USUARIO
def excluir_usuario(session, id):
    # verifica se esse usuario existe
    existe = session.query(UserModel.id == id).first()
    if not existe:
        raise ErroUserNaoEncontrado(session)

    # tratamento de erro
    try:
        # exclui o usuario e salva as alteracoes no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"O usuario foi excluido com sucesso!"}
    
    except:
        session.rollback()
        raise ErroUserExiste(session)