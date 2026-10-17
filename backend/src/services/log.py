from ..models import LogModel
from ..services.user import ler_usuario_id
from .erros import ErroInesperado

#region FUNCAO CRIAR LOG
def criar_log(session, id: int, acao: str, tb_acao: str):
    # tratamento de erros
    try:
        user = ler_usuario_id(session, id)

        matricula = user.matricula

        # cria o objeto log
        log = LogModel(matricula, acao, tb_acao)

        # adiciona o objeto no banco e salva
        session.add(log)
        session.commit()

    except Exception as e:
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER LOG
def ler_log(session):
    return session.query(LogModel).all()
#endregion

