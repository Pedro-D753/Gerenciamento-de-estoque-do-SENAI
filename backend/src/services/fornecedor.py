from ..models.fornecedor import FornecedorModel
from .erros import ErroFornecedorExiste, ErroFornecedorNaoEncontrado, ErroInesperado

#region FUNCAO CRIAR FORNECEDOR
def criar_fornecedor(session, dados):
    # verifica se existe
    existe = session.query(FornecedorModel).filter(FornecedorModel.nome == dados.nome,
                                                FornecedorModel.cnpj == dados.cnpj,
                                                FornecedorModel.contato == dados.contato,
                                                FornecedorModel.is_ativo == dados.is_ativo).first()

    if existe:
        return ErroFornecedorExiste(session)

    # tratamento de erros
    try:
        # cria objeto
        fornecedor = FornecedorModel(dados.nome, dados.cnpj, dados.contato, dados.is_ativo)

        # salva no banco
        session.add(fornecedor)
        session.commit()

        return {"mensagem":"Fornecedor criado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO LER FORNECEDOR
def ler_fornecedor(session):
    return session.query(FornecedorModel).all()

def ler_fornecedor(session, id):
    return session.query(FornecedorModel).filter(FornecedorModel.id == id).first()
#endregion

#region FUNCAO ATUALIZAR FORNECEDOR
def atualizar_fornecedor(session, dados_old, dados_new):
    # verifica se existe
    existe_old = session.query(FornecedorModel).filter(FornecedorModel.nome == dados_old.nome,
                                                FornecedorModel.cnpj == dados_old.cnpj,
                                                FornecedorModel.contato == dados_old.contato,
                                                FornecedorModel.is_ativo == dados_old.is_ativo).first()
    existe_new = session.query(FornecedorModel).filter(FornecedorModel.nome == dados_new.nome,
                                                FornecedorModel.cnpj == dados_new.cnpj,
                                                FornecedorModel.contato == dados_new.contato,
                                                FornecedorModel.is_ativo == dados_new.is_ativo).first()

    if not existe_old:
        return ErroFornecedorNaoEncontrado(session)

    if existe_new:
        return ErroFornecedorExiste(session)

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.nome = existe_new.nome
        existe_old.cnpj = existe_new.cnpj
        existe_old.contato = existe_new.contato
        existe_old.is_ativo = existe_new.is_ativo

        # atualiza o banco e salva as alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Fornecedor atualizado com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion

#region FUNCAO EXCLUIR FORNECEDOR
def excluir_fornecedor(session, id):
    # verifica se existe
    existe = session.query(FornecedorModel).filter(FornecedorModel.id == id).first()

    if not existe: 
        return ErroFornecedorNaoEncontrado(session)
    
    #tratamento de dados
    try:
        # deleta objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Fornecedor excluido com sucesso!!"}
    
    except Exception as e:
        return ErroInesperado(e, session)
#endregion