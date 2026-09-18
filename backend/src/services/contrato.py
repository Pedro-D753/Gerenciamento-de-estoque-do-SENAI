from ..models.contratos import ContratoModel
from .erros import ErroInesperado, ErroContratoExiste, ErroContratoNaoEncontrado

# FUNCAO CRIAR CONTRATO
def criar_contrato(session, dados):
    # verifica se existe esse contrato
    existe = session.query(ContratoModel).filter(ContratoModel.dt_inicio == dados.dt_inicio,
    ContratoModel.dt_final == dados.dt_final,
    ContratoModel.registro_id == dados.registro_id,
    ContratoModel.fornecedor_id == dados.fornecedor_id)
    if existe:
        raise ErroContratoExiste(session)

    try:
        # cria o objeto contrato
        contrato = ContratoModel(dados.dt_inicio, dados.dt_final, dados.registro_id, dados.fornecedor_id)

        # adiciona o objeto ao banco e salva
        session.add(contrato)
        session.commit()

        return {"mensagem":"O contrato foi criado com sucesso!"}
    
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)

# FUNCAO LER CONTRATO
def ler_contrato(session):
    return session.query(ContratoModel).all()

# FUNCAO ATUALIZAR CONTRATO
def atualizar_contrato(session, dados_old, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = session.query(ContratoModel).filter(ContratoModel.dt_final == dados_old.dt_final,
                                                     ContratoModel.dt_inicial == dados_old.dt_inicial,
                                                     ContratoModel.registro_id == dados_old.registro_id,
                                                     ContratoModel.fornecedor_id == dados_old.fornecedor_id).first()
    existe_new = session.query(ContratoModel).filter(ContratoModel.dt_final == dados_new.dt_final,
                                                     ContratoModel.dt_inicial == dados_new.dt_inicial,
                                                     ContratoModel.registro_id == dados_new.registro_id,
                                                     ContratoModel.fornecedor_id == dados_new.fornecedor_id).first()
    # se nao existir os dados do antigo contrato
    if not existe_old:
        raise ErroContratoNaoEncontrado(session)

    # se existir os dados do novo contrato
    if existe_new:
        raise ErroContratoExiste(session)

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.dt_inicio = dados_new.dt_inicio
        existe_old.dt_final = dados_new.dt_final
        existe_old.registro_id = dados_new.registro_id
        existe_old.fornecedor_id = dados_new.fornecedor_id

        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"O contrato foi atualizado!"}

    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)
    
# FUNCAO EXCLUIR CONTRATO
def excluir_contrato(session, id):
    # verificar se existe esse usuario
    existe = session.query(ContratoModel).filter(ContratoModel.id == id).first()
    if existe:
        raise ErroContratoExiste(session)

    # tratamento de erro
    try:
        # excluir objeto do banco e salvar alteracoes do banco
        session.delete()
        session.commit()

        return {"mensagem":"Contrato excluido com sucesso!"}
    
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)