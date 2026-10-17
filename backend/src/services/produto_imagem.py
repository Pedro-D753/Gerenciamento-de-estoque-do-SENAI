import logging

from ..models.produto import ProdutoModel
from . import storage
from .erros import (
    ErroImagemNaoEncontrada,
    ErroInesperado,
    ErroProdutoNaoEncontrado,
    ErroStorageIndisponivel,
)

log = logging.getLogger("uvicorn.error")


def _buscar_produto(session, id):
    produto = session.query(ProdutoModel).filter(ProdutoModel.id == id).first()
    if not produto:
        raise ErroProdutoNaoEncontrado(session)
    return produto


def apagar_se_orfa(session, img_hash):
    if not img_hash:
        return

    em_uso = session.query(ProdutoModel.id).filter(ProdutoModel.img_hash == img_hash).first()
    if em_uso:
        return

    try:
        storage.excluir_imagem(img_hash)
    except ErroStorageIndisponivel:
        log.warning("Não foi possível apagar o objeto órfão %s", img_hash)


def salvar_imagem_produto(session, id, dados: bytes):
    produto = _buscar_produto(session, id)
    novo_hash = storage.salvar_imagem(dados)
    antigo_hash = produto.img_hash

    if antigo_hash != novo_hash:
        try:
            produto.img_hash = novo_hash
            session.commit()
        except Exception as e:
            raise ErroInesperado(e, session)

        apagar_se_orfa(session, antigo_hash)

    return {"mensagem": "Imagem do produto salva com sucesso!"}


def hash_da_imagem(session, id) -> str:
    produto = _buscar_produto(session, id)
    if not produto.img_hash:
        raise ErroImagemNaoEncontrada()
    return produto.img_hash


def remover_imagem_produto(session, id):
    produto = _buscar_produto(session, id)
    if not produto.img_hash:
        raise ErroImagemNaoEncontrada()

    antigo_hash = produto.img_hash
    try:
        produto.img_hash = None
        session.commit()
    except Exception as e:
        raise ErroInesperado(e, session)

    apagar_se_orfa(session, antigo_hash)
    return {"mensagem": "Imagem do produto removida com sucesso!"}
