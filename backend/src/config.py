from dotenv import load_dotenv
from pathlib import Path
from os import getenv
from urllib.parse import quote_plus

class EnvVaulesErros(Exception): pass

# Resolve o caminho até a raiz do programa e ler o .env
path_env = Path(__file__).resolve().parents[1] / ".env"

if path_env.exists() == True:
    load_dotenv(dotenv_path = path_env)

"""Garante que a senha com caracteres especiais seja lida como senha,
    não como parte do endereço. Sem o quote_plus, o SQLAlchemy pode interpretar
    os carecteres como: '@' como parte do endereço, e não da senha."""
DB_PASSWORD = quote_plus(str(getenv("DB_PASSWORD")))
DB_USER = getenv("DB_USER", None)
DB_NAME = getenv("DB_NAME", None)
DB_HOST = getenv("DB_HOST", "db")

if DB_USER.strip() == True or DB_USER == None: 
    raise EnvVaulesErros("O campo \"DB_USER\" não pode ser null(None) ou ser apenas espaços.")

if DB_NAME.strip() == True or DB_NAME == None: 
    raise EnvVaulesErros("O campo \"DB_NAME\" não pode ser null(None) ou ser apenas espaços.")

try:
    DB_PORT = int(getenv("DB_PORT", 5432))
except:
    raise EnvVaulesErros("O campo \"DB_PORT\" só pode ser int.")
