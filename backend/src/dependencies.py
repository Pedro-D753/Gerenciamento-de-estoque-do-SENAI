from jose import jwt, JWTError
from .services.erros import ErroInesperado, ErroJwtInvalido
from .config import SECRET_KEY, ALG
from .db.conection import Session

def verificar_jwt(token: str) -> tuple[int, bool]:
    try:
        dict_info = jwt.decode(token, str(SECRET_KEY), str(ALG))
        id = int(dict_info['sub'])
        is_admin = bool(dict_info["is_admin"])

        return id, is_admin
    
    except JWTError:
        raise ErroJwtInvalido()
    
    except Exception as e:
        raise ErroInesperado(e)

# Garante que, ao usar a ORM como dependência, a sessão será fechada automaticamente
def get_sesion():
    session = Session()
    try:
        yield session
    finally:
        session.close()

