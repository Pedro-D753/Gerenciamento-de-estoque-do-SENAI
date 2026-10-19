from fastapi import APIRouter, Depends, File, Request, Response, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral, jwt_estoquista
from ..services import produto, estoque, log, produto_imagem, storage
from ..services.erros import ErroImagemInvalida
from ..schemas import produto as BaseProduto
from ..schemas import estoque as BaseEstoque
from ..models.user import UserModel
from ..models.unidade import UnidadeModel

router = APIRouter(
    prefix='/produtos',
    tags=["Produto"],

    responses={
        404:{"description":"Essa produto não foi encontrado."}
    }
)

@router.get("/")
async def pega_produto(_id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as produtos criadas \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler produto", id=_id_user_acao, tb_acao="Produto")

    return produto.ler_produto(session)


@router.get("/{id}")
async def pega_produto_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a produto criada com base no id \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler produto pelo id", id=_id_user_acao, tb_acao="Produto")

    return produto.ler_produto_id(session, id)

@router.post("/")
async def criar_produto(base: BaseProduto.ProdutoSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar produto \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Produto criado: {base.nome}", id=_id_user_acao, tb_acao="Produto")

    return produto.criar_produto(session, base)


@router.post("/com-estoque")
async def criar_produto_com_estoque(
    base: BaseProduto.ProdutoComEstoqueSchema,
    id_usuario: int = Depends(jwt_geral),
    session: Session = Depends(get_sesion),
):
    usuario = session.query(UserModel).filter(UserModel.id == id_usuario).first()
    if usuario is None:
        return {"mensagem": "Usuário não encontrado."}

    produto_criado = produto.criar_produto(session, base)
    estoque_criado = estoque.criar_estoque(
        session,
        BaseEstoque.EstoqueSchema(
            qtd=base.qtd,
            qtd_minima=base.qtd_minima,
            preco_unitario=base.preco_unitario,
            is_ativo=base.is_ativo,
            localidade=str(usuario.unidade_id),
            dt_validade=base.dt_validade,
            produto_id=produto_criado["id"],
            unidade_id=usuario.unidade_id,
        ),
    )
    unidade = session.query(UnidadeModel).filter(UnidadeModel.id == usuario.unidade_id).first()
    log.criar_log(session=session, acao=f"Estoque criado para o produto {produto_criado['id']}", id=id_usuario, tb_acao="Estoque")
    return {
        "mensagem": "Produto e estoque cadastrados com sucesso.",
        "id": produto_criado["id"],
        "estoque_id": estoque_criado["id"],
        "unidade": unidade.nome if unidade else None,
    }

@router.delete("/{id}")
async def delete_produto(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o produto \
    \n Essa rota pertence somente ao admin."""
    log.criar_log(session=session, acao=f"Produto deletado: {id}", id=_id_user_acao, tb_acao="Produto")

    return produto.excluir_produto(session, id)

@router.patch("/{id}")
async def atualizar_produto(id: int, base: BaseProduto.ProdutoUpdateSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar produto \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"Produto alterado: {id}", id=_id_user_acao, tb_acao="Produto")

    return produto.atualizar_produto(session, id, base)


@router.patch("/{id}/estoquista")
async def atualizar_produto_estoquista(
    id: int,
    base: BaseProduto.ProdutoEstoquistaUpdateSchema,
    id_usuario: int = Depends(jwt_estoquista),
    session: Session = Depends(get_sesion),
):
    log.criar_log(
        session=session,
        acao=f"Item e estoque alterados: {id}",
        id=id_usuario,
        tb_acao="Estoque",
    )
    return produto.atualizar_produto_estoquista(session, id, id_usuario, base)


@router.put("/{id}/imagem")
def enviar_imagem(
    id: int,
    arquivo: UploadFile = File(...),
    _id_user_acao: int = Depends(jwt_geral),
    session: Session = Depends(get_sesion),
):
    """Envia ou substitui a imagem do produto no armazenamento configurado. \
    \n Essa rota pertence somente ao admin."""
  
    if arquivo.size is not None and arquivo.size > storage.TAMANHO_MAX:
        raise ErroImagemInvalida("Arquivo maior que 5 MB.", 413)

    dados = arquivo.file.read(storage.TAMANHO_MAX + 1)
    if len(dados) > storage.TAMANHO_MAX:
        raise ErroImagemInvalida("Arquivo maior que 5 MB.", 413)
    
    log.criar_log(session=session, acao="imagen criada", id=_id_user_acao, tb_acao="BANCO MIMO")

    return produto_imagem.salvar_imagem_produto(session, id, dados)


@router.get("/{id}/imagem")
def ver_imagem(id: int, request: Request, _id_user_acao: int = Depends(jwt_geral) , session: Session = Depends(get_sesion)):
    """Retorna a imagem pública do produto para uso direto em elementos img \
    \n Essa rota tem que está logado."""
    img_hash = produto_imagem.hash_da_imagem(session, id)
    cabecalhos = {
        "ETag": f'"{img_hash}"',
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
    }
    if storage.etag_confere(request.headers.get("if-none-match"), img_hash):
        return Response(status_code=304, headers=cabecalhos)

    corpo, content_type, tamanho = storage.abrir_imagem(img_hash)
    cabecalhos["Content-Length"] = str(tamanho)
    
    log.criar_log(session=session, acao="imagen acessada", id=_id_user_acao, tb_acao="BANCO MIMO")
    
    return StreamingResponse(storage.iterar(corpo), media_type=content_type, headers=cabecalhos)


@router.delete("/{id}/imagem")
def remover_imagem(
    id: int,
    _id_user_acao: int = Depends(jwt_admin),
    session: Session = Depends(get_sesion),
):
    """Remove a imagem do produto. \
    \n Essa rota pertence somente ao admin."""

    log.criar_log(session=session, acao=f"imagen deletada do produto {id}", id=_id_user_acao, tb_acao="BANCO MIMO")
    
    return produto_imagem.remover_imagem_produto(session, id)
