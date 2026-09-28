from .erros import ErroInesperado, ErroDepartamentoExiste, ErroDepartamentoNaoEncontrado
from ..models.departamento import DepartamentoModel

#region FUNCAO CRIAR DEPARTAMENTO
def criar_departamento(session, dados):
    # verifica se existe esse departamento
    existe = session.query(DepartamentoModel).filter(dados.nome).first()
    if existe:
        return ErroDepartamentoExiste(session)

    # tratamento de erros
    try:
        # cria objeto departamento
        departamento = DepartamentoModel(dados.nome)

        # adiciona e salva no banco
        session.add(departamento)
        session.commit()

        return {"mensagem":"Departamento criado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO LER DEPARTAMENTO
def ler_departamento(session):
    return session.query(DepartamentoModel).all()

def ler_departamento(session, id):
    return session.query(DepartamentoModel).filter(DepartamentoModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR DEPARTAMENTO
def atualizar_departamento(session, dados_old, dados_new):
    # verifica se existe
    existe_old = session.query(DepartamentoModel).filter(DepartamentoModel.nome == dados_old.nome).first()
    existe_new = session.query(DepartamentoModel).filter(DepartamentoModel.nome == dados_new.nome).first()

    if not existe_old:
        return ErroDepartamentoNaoEncontrado(session)
    if existe_new:
        return ErroDepartamentoExiste(session)
    
    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.nome = existe_new.nome

        # atualiza mudancas no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Departamento atualizado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR DEPARTAMENTO
def excluir_departamento(session, id):
    # verifica se existe
    existe = session.query(DepartamentoModel).filter(DepartamentoModel.id == id).first()

    if not existe:
        return ErroDepartamentoNaoEncontrado(session)

    # tratamento de erros
    try:
        # apaga objeto e salva a alteracao no banco
        session.delete(existe)
        session.commit()
    
        return {"mensagem":"Departamento excluido com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion