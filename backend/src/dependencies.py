from jose import jwt, JWTError
from fastapi import Depends
from .services.erros import ErroInesperado, ErroJwtInvalido
from .config import SECRET_KEY, ALG, oauth2_schemas
from .db.postgresql_conection import Session

def verificar_jwt(token: str):
    try:
        dict_info = jwt.decode(token, str(SECRET_KEY), str(ALG))
        id = int(dict_info['sub'])
        is_admin = bool(dict_info["is_admin"])
        is_reste_senha = bool(dict_info["is_reste_senha"])
        jit = str(dict_info["jit"])

        return id, is_admin, is_reste_senha, jit
        
    except JWTError:
        raise ErroJwtInvalido()
    
    except Exception as e:
        raise ErroInesperado(e)

def jwt_admin( token: str = Depends(oauth2_schemas)):
    try:
        id, is_admin, is_reste_senha, _  = verificar_jwt(token)

        if is_reste_senha == True or is_admin == False:
            raise ErroJwtInvalido()

        return id
    
    except ErroJwtInvalido : raise
    
    except Exception as e:
        raise ErroInesperado(e)
    
def jwt_estoquista(token: str = Depends(oauth2_schemas)):
    try:
        id, is_admin, is_reste_senha, _  = verificar_jwt(token)
        if is_reste_senha == True or is_admin == True:
            raise ErroJwtInvalido()

        return id
    
    except ErroJwtInvalido : raise
    
    except Exception as e:
        raise ErroInesperado(e)
    
def jwt_geral(token: str = Depends(oauth2_schemas)):
    try:
        id, _, is_reste_senha, _  = verificar_jwt(token)
        if is_reste_senha == True:
            raise ErroJwtInvalido()
        
        return id
        
    except ErroJwtInvalido : raise
    
    except Exception as e:
        raise ErroInesperado(e)


# Garante que, ao usar a ORM como dependência, a sessão será fechada automaticamente
def get_sesion():
    session = Session()
    try:
        yield session
    finally:
        session.close()

