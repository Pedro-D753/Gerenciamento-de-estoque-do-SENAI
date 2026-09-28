from ..models.user import UserModel
from .erros import ErroInesperado, ErroUserExiste, ErroUserNaoEncontrado
from ..config import SECRETES_KEY, ALG, TIMER
from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timezone

#region FUNCAO CRIAR USUARIO
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
#endregion

#region FUNCAO LER USUARIO
def ler_usuario(session):
    return session.query(UserModel).all()

def ler_usuario_id(session, id):
    return session.query(UserModel).filter(UserModel.id == id).first()
#endregion

#region FUNCAO JWT
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

def autenticar(session, dados):
    # verifica se existe
    existe = session.query(UserModel).filter(UserModel.matricula == dados.matricula).first()

    if not existe:
        return False

    if not UserModel.verificarSenha(dados.senha, existe.senha):
        return False

    return criar_token(existe.id, existe.is_admin)
#endregion

#region FUNCAO ATUALIZAR USUARIO
def atualizar_usuario(session, dados_old, dados_new):
    # verifica se existe
    existe_old = session.query(UserModel).filter(UserModel.nome == dados_old.nome,
                                                 UserModel.email == dados_old.email,
                                                 UserModel.senha == dados_old.senha,
                                                 UserModel.matricula == dados_old.matricula,
                                                 UserModel.is_admin == dados_old.is_admin,
                                                 UserModel.is_ativo == dados_old.is_ativo,
                                                 UserModel.unidade_id == dados_old.unidade_id).first()
    existe_new = session.query(UserModel).filter(UserModel.nome == dados_new.nome,
                                                 UserModel.email == dados_new.email,
                                                 UserModel.senha == dados_new.senha,
                                                 UserModel.matricula == dados_new.matricula,
                                                 UserModel.is_admin == dados_new.is_admin,
                                                 UserModel.is_ativo == dados_new.is_ativo,
                                                 UserModel.unidade_id == dados_new.unidade_id).first()
    if not existe_old:
        return ErroUserNaoEncontrado(session)

    if existe_new:
        return ErroUserExiste(session)

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.nome = existe_new.nome
        existe_old.email = existe_new.email
        existe_old.senha = existe_new.senha
        existe_old.matricula = existe_new.matricula
        existe_old.is_admin = existe_new.is_admin
        existe_old.is_ativo = existe_new.is_ativo
        existe_old.unidade_id = existe_new.unidade_id

        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Usuario atualizado com sucesso!!"}

    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR USUARIO
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
        raise ErroUserExiste(session)
#endregion