from fastapi import HTTPException
from datetime import datetime
from ..models.solicitacao import SolicitacaoModel, SolicitacaoTipoEnum
from ..models.estoque_solicitacao import EstoqueSolicitacaoModel
from ..models.estoque import EstoqueModel
from ..models.produto import ProdutoModel
from ..models.unidade import UnidadeModel
from ..models.user import UserModel
from .erros import ErroInesperado, ErroSolicitacaoExiste, ErroSolicitacaoNaoEncontrado
from .estoque_solicitado import criar_estoque_solicitado, atualizar_estoque_solicitado, excluir_estoque_solicitado


def _serializar_solicitacao(solicitacao, estoque_solicitado, estoque=None, produto=None, unidade=None):
    return {
        "solicitacao": {
            "id": solicitacao.id,
            "is_aceito": solicitacao.is_aceito,
            "obs_solicita": solicitacao.obs_solicita,
            "obs_recusa": solicitacao.obs_recusa,
            "obs_pad": solicitacao.obs_pad,
            "tipo": solicitacao.tipo,
            "estado": solicitacao.estado,
            "qtd_acao": solicitacao.qtd_acao,
            "dt_acao": solicitacao.dt_acao,
            "solicitante": solicitacao.solicitante,
            "dt_solicitacao": solicitacao.dt_solicitacao,
            "dt_retirada": solicitacao.dt_retirada,
        },
        "estoque_solicitado": {
            "id": estoque_solicitado.id,
            "estoque_id": estoque_solicitado.estoque_id,
            "solicitacao_id": estoque_solicitado.solicitacao_id,
            "produto_id": estoque.produto_id if estoque else None,
            "produto_nome": produto.nome if produto else None,
            "produto_codigo": produto.codigo_barra if produto else None,
            "categoria_id": produto.categoria_id if produto else None,
            "unidade_nome": unidade.nome if unidade else None,
            "estoque_qtd": estoque.qtd if estoque else None,
        },
    }

#region FUNCAO CRIAR SOLICITACAO
def _adicionar_solicitacao(session, dados):
    solicitacao = SolicitacaoModel(
        dados.is_aceito, dados.obs_solicita, dados.obs_recusa, dados.tipo,
        dados.estado, dados.qtd_acao, dados.dt_acao, dados.solicitante,
        dados.dt_solicitacao, dados.dt_retirada, dados.obs_pad
    )
    session.add(solicitacao)
    session.flush()
    criar_estoque_solicitado(session, dados, solicitacao)


def criar_solicitacao(session, dados):
    try:
        _adicionar_solicitacao(session, dados)
        session.commit()
        return {"mensagem":"Solicitacao criada com sucesso!"}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)


def criar_solicitacoes(session, solicitacoes):
    try:
        for dados in solicitacoes:
            _adicionar_solicitacao(session, dados)
        session.commit()
        return {"mensagem": f"{len(solicitacoes)} solicitação(ões) criada(s) com sucesso."}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)
#endregion

#region FUNCAO LER SOLICITACAO
def _solicitacoes_query(session, user_id):
    user = session.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    query = (
        session.query(SolicitacaoModel, EstoqueSolicitacaoModel, EstoqueModel, ProdutoModel, UnidadeModel)
        .join(EstoqueSolicitacaoModel, SolicitacaoModel.id == EstoqueSolicitacaoModel.solicitacao_id)
        .join(EstoqueModel, EstoqueModel.id == EstoqueSolicitacaoModel.estoque_id)
        .join(ProdutoModel, ProdutoModel.id == EstoqueModel.produto_id)
        .join(UnidadeModel, UnidadeModel.id == EstoqueModel.unidade_id)
    )
    if not user.is_admin:
        query = query.filter(EstoqueModel.unidade_id == user.unidade_id)
    return query


def ler_solicitacao(session, user_id):
    resultados = _solicitacoes_query(session, user_id).all()
    return [_serializar_solicitacao(solicitacao, estoque_solicitado, estoque, produto, unidade)
            for solicitacao, estoque_solicitado, estoque, produto, unidade in resultados]

def ler_solicitacao_id(session, id, user_id):
    resultado = _solicitacoes_query(session, user_id).filter(SolicitacaoModel.id == id).first()

    if not resultado:
        return None

    solicitacao, estoque_solicitado, estoque, produto, unidade = resultado
    return _serializar_solicitacao(solicitacao, estoque_solicitado, estoque, produto, unidade)
#endregion

#region FUNCAO ATUALIZAR SOLICITACAO
def _get_request_and_stock(session, request_id, user_id=None):
    solicitacao = (
        session.query(SolicitacaoModel)
        .filter(SolicitacaoModel.id == request_id)
        .with_for_update()
        .first()
    )
    if solicitacao is None:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    link = (
        session.query(EstoqueSolicitacaoModel)
        .filter(EstoqueSolicitacaoModel.solicitacao_id == request_id)
        .first()
    )
    if link is None:
        raise HTTPException(status_code=404, detail="O estoque desta solicitação não foi encontrado.")

    stock_query = session.query(EstoqueModel).filter(EstoqueModel.id == link.estoque_id)
    if user_id is not None:
        user = session.query(UserModel).filter(UserModel.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        stock_query = stock_query.filter(EstoqueModel.unidade_id == user.unidade_id)
    stock = stock_query.with_for_update().first()
    if stock is None:
        if user_id is not None:
            raise HTTPException(status_code=403, detail="A solicitação não pertence à sua unidade.")
        raise HTTPException(status_code=404, detail="O estoque desta solicitação não foi encontrado.")
    return solicitacao, stock


def recusar_solicitacao(session, request_id, dados, user_id=None):
    try:
        if user_id is None:
            solicitacao = (
                session.query(SolicitacaoModel)
                .filter(SolicitacaoModel.id == request_id)
                .with_for_update()
                .first()
            )
            if solicitacao is None:
                raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
        else:
            solicitacao, _ = _get_request_and_stock(session, request_id, user_id)
        if getattr(solicitacao.tipo, "value", solicitacao.tipo) != "EmAndamento":
            raise HTTPException(status_code=409, detail="Somente solicitações em andamento podem ser recusadas.")

        solicitacao.is_aceito = False
        solicitacao.tipo = SolicitacaoTipoEnum.Cancelada
        solicitacao.obs_pad = dados.obs_pad.strip()
        solicitacao.obs_recusa = dados.obs_recusa.strip()
        solicitacao.dt_acao = datetime.now()
        session.commit()
        return {"mensagem": "Solicitação recusada com sucesso."}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)


def separar_solicitacao(session, request_id, user_id):
    try:
        solicitacao, stock = _get_request_and_stock(session, request_id, user_id)
        if getattr(solicitacao.tipo, "value", solicitacao.tipo) != "EmAndamento":
            raise HTTPException(status_code=409, detail="Somente solicitações em andamento podem ser separadas.")
        if solicitacao.qtd_acao <= 0 or solicitacao.qtd_acao > stock.qtd:
            raise HTTPException(
                status_code=409,
                detail=f"Estoque insuficiente para separar. Disponível: {stock.qtd}; solicitado: {solicitacao.qtd_acao}.",
            )

        stock.qtd -= solicitacao.qtd_acao
        solicitacao.is_aceito = True
        solicitacao.tipo = SolicitacaoTipoEnum.Separada
        solicitacao.dt_acao = datetime.now()
        session.commit()
        return {"mensagem": "Itens separados e baixados do estoque com sucesso."}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)


def retirar_solicitacao(session, request_id, user_id):
    try:
        solicitacao, _ = _get_request_and_stock(session, request_id, user_id)
        if getattr(solicitacao.tipo, "value", solicitacao.tipo) != "Separada":
            raise HTTPException(status_code=409, detail="Somente solicitações separadas podem ser retiradas.")

        solicitacao.tipo = SolicitacaoTipoEnum.Retirada
        solicitacao.dt_retirada = datetime.now()
        solicitacao.dt_acao = datetime.now()
        session.commit()
        return {"mensagem": "Retirada registrada com sucesso."}
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise ErroInesperado(e, session)


def atualizar_solicitacao(session, id, dados_new):
    # verifica se existe essas informacoes no banco
    existe_old = (
        session.query(SolicitacaoModel)
        .filter(SolicitacaoModel.id == id)
        .with_for_update()
        .first()
    )
    
    existe_new = session.query(SolicitacaoModel).filter(SolicitacaoModel.is_aceito == dados_new.is_aceito,
                                                        SolicitacaoModel.obs_solicita == dados_new.obs_solicita,
                                                        SolicitacaoModel.obs_recusa == dados_new.obs_recusa,
                                                        SolicitacaoModel.tipo == dados_new.tipo,
                                                        SolicitacaoModel.estado == dados_new.estado,
                                                        SolicitacaoModel.qtd_acao == dados_new.qtd_acao,
                                                        SolicitacaoModel.dt_acao == dados_new.dt_acao).first()
    # se os dados antigos da Solicitacao nao existir
    if not existe_old:
        raise ErroSolicitacaoNaoEncontrado(session)
    
    # se os dados novos já existirem em outra Solicitacao
    if existe_new:
        raise ErroSolicitacaoExiste(session)
    
    # tratamento de erro
    try:
        estoque = None
        aprovando = (
            getattr(existe_old.tipo, "value", existe_old.tipo) == "EmAndamento"
            and dados_new.is_aceito is True
        )
        if aprovando:
            if dados_new.tipo is not None and getattr(dados_new.tipo, "value", dados_new.tipo) != "Concluida":
                raise HTTPException(
                    status_code=422,
                    detail="Uma solicitação aprovada precisa estar com status Concluida.",
                )
            vinculo = (
                session.query(EstoqueSolicitacaoModel)
                .filter(EstoqueSolicitacaoModel.solicitacao_id == id)
                .first()
            )
            estoque = (
                session.query(EstoqueModel)
                .filter(EstoqueModel.id == vinculo.estoque_id)
                .with_for_update()
                .first()
                if vinculo
                else None
            )
            if estoque is None:
                raise HTTPException(status_code=404, detail="O estoque desta solicitação não foi encontrado.")
            if existe_old.qtd_acao <= 0 or existe_old.qtd_acao > estoque.qtd:
                raise HTTPException(
                    status_code=409,
                    detail=f"Estoque insuficiente para aprovar. Disponível: {estoque.qtd}; solicitado: {existe_old.qtd_acao}.",
                )
            estoque.qtd -= existe_old.qtd_acao

        # atualiza o objeto Solicitacao
        for field in ("is_aceito", "obs_solicita", "obs_recusa", "obs_pad", "tipo", "estado", "qtd_acao", "dt_acao", "solicitante", "dt_solicitacao", "dt_retirada"):
            value = getattr(dados_new, field)
            if value is not None:
                setattr(existe_old, field, value)
        if aprovando and dados_new.tipo is None:
            existe_old.tipo = SolicitacaoTipoEnum.Concluida

        # adiciona o objeto no banco e salva
        session.commit()
        session.refresh(existe_old)

        if dados_new.estoque_id is not None:
            atualizar_estoque_solicitado(session, id, dados_new)

        return {"mensagem":"Solicitacao atualizada com sucesso!"}

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion
       
#region FUNCAO EXCLUIR SOLICITACAO
def excluir_solicitacao(session, id):
    # verifica se existe essa solicitacao no banco
    existe = session.query(SolicitacaoModel).filter(SolicitacaoModel.id == id).first()
    if not existe:
        raise ErroSolicitacaoNaoEncontrado(session)
    
    # tratamento de erro
    try:
        excluir_estoque_solicitado(session, id)

        session.flush()

        # deleta o objeto e salva as mudancas no banco
        session.delete(existe)
        
        session.commit()


        return {"mensagem":"Solicitacao foi excluida com sucesso!"}
    
    except Exception as e:
        raise ErroInesperado(e, session)
#endregion