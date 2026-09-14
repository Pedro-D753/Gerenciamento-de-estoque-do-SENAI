from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from ..config import DB_NAME, DB_PASSWORD, DB_USER, DB_HOST, DB_PORT

endereco_db = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(endereco_db) 

# Classe base para os modelos
Base = declarative_base()

# Cria a sessão para manipular a db
Session = sessionmaker(bind=engine)

# Garante que, ao usar a ORM como dependência, a sessão será fechada automaticamente
def get_sesion():
    session = Session()
    try:
        yield session
    finally:
        session.close()
