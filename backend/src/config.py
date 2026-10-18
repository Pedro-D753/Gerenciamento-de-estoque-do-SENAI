from dotenv import load_dotenv
from pathlib import Path
from os import getenv
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer
from urllib.parse import quote_plus

class EnvVaulesErros(Exception): pass

# Resolve o caminho até a raiz do programa e ler o .env
path_env = Path(__file__).resolve().parents[2] / ".env"

if path_env.exists() == True:
    load_dotenv(dotenv_path = path_env)


#region DB_CONFIG
"""Garante que a senha com caracteres especiais seja lida como senha,
    não como parte do endereço. Sem o quote_plus, o SQLAlchemy pode interpretar
    os carecteres como: '@' como parte do endereço, e não da senha."""
DB_PASSWORD_REDIS = getenv("DB_PASSWORD")
DB_PASSWORD = quote_plus(str(DB_PASSWORD_REDIS))
DB_USER = getenv("DB_USER", None)
DB_NAME = getenv("DB_NAME", None)
DB_HOST = getenv("DB_HOST", "db")
REDIS_HOST = getenv("DB_HOST", DB_HOST)

if DB_USER == None: 
    raise EnvVaulesErros("O campo \"DB_USER\" não pode ser null(None) ou ser apenas espaços.")

if DB_NAME == None: 
    raise EnvVaulesErros("O campo \"DB_NAME\" não pode ser null(None) ou ser apenas espaços.")

#endregion

#region Config do JWT
SECRET_KEY = getenv("SECRET_KEY", None)
if SECRET_KEY == None:
    raise EnvVaulesErros("O campo \"SECRET_KEY\" não pode ser null(None) ou ser apenas espaços.")

ALG = "HS256"

TIMER_REFRESH = timedelta(days=7)
TIMER_ACCESS = timedelta(minutes=30)

#endregion 

#region Config Email
EMAIL_EMISOR = getenv("EMAIL_EMISOR", None)
if EMAIL_EMISOR == None:
    raise EnvVaulesErros("O campo \"EMAIL_EMISOR\" não pode ser null(None) ou ser apenas espaços.")

EMAIL_SENHA = getenv("EMAIL_SENHA", None)
if EMAIL_SENHA == None:
    raise EnvVaulesErros("O campo \"EMAIL_SENHA\" não pode ser null(None) ou ser apenas espaços.")

DNS_RETORNO = getenv("DNS_RETORNO", None)
if DNS_RETORNO == None:
    raise EnvVaulesErros("O campo \"DNS_RETORNO\" não pode ser null(None) ou ser apenas espaços.")

#endregion

#region Minio
# Configuração opcional do armazenamento de imagens. A conexão só é usada
# quando uma rota de imagem for chamada.
MINIO_ENDPOINT = getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_BUCKET = getenv("MINIO_BUCKET", "estoque")
MINIO_ACCESS_KEY = getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = getenv("MINIO_SECRET_KEY", "minioadmin")
#endregion

oauth2_schemas= OAuth2PasswordBearer(tokenUrl="/auth/login")
