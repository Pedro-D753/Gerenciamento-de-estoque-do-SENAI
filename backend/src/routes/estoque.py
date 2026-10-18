from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_estoquista, jwt_geral
from ..services import estoque, log
from ..schemas import estoque as BaseEstoque
from ..models.estoque import EstoqueModel
from ..models.user import UserModel
from ..models.unidade import UnidadeModel

router = APIRouter(
    prefix='/estoques',
    tags=["Estoque"],

    responses={
        404:{"description":"Essa estoque não foi encontrado."}
    }
)

@router.get("/")
async def pega_estoque(_id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as estoques criadas  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler estoque", id=_id_user_acao, tb_acao="Estoque")

    return estoque.ler_estoque(session)


@router.get("/minha-unidade")
async def pega_estoque_minha_unidade(
    id_usuario: int = Depends(jwt_geral),
    session: Session = Depends(get_sesion),
):
    usuario = session.query(UserModel).filter(UserModel.id == id_usuario).first()
    if usuario is None:
        return []
    registros = (
        session.query(EstoqueModel, UnidadeModel)
        .join(UnidadeModel, UnidadeModel.id == EstoqueModel.unidade_id)
        .filter(EstoqueModel.unidade_id == usuario.unidade_id)
        .all()
    )
    return [
        {
            "id": item.id,
            "qtd": item.qtd,
            "qtd_minima": item.qtd_minima,
            "preco_unitario": item.preco_unitario,
            "is_ativo": item.is_ativo,
            "localidade": item.localidade,
            "dt_validade": item.dt_validade,
            "produto_id": item.produto_id,
            "unidade_id": unidade.id,
            "unidade": {"id": unidade.id, "nome": unidade.nome},
        }
        for item, unidade in registros
    ]


@router.get("/{id}")
async def pega_estoque_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a estoque criada com base no id  \
    \n Essa rota tem que está logado."""
    log.criar_log(session=session, acao="ler estoque pelo id", id=_id_user_acao, tb_acao="Estoque")

    return estoque.ler_estoque_id(session, id)

@router.post("/")
async def criar_estoque(base: BaseEstoque.EstoqueSchema, _id_user_acao: int = Depends(jwt_estoquista), session: Session = Depends(get_sesion)):
    """\n Criar estoque \
    \n Essa rota pertence somente ao Estoquista."""
    log.criar_log(session=session, acao="Estoque criada", id=_id_user_acao, tb_acao="Estoque")

    return estoque.criar_estoque(session, base)

@router.delete("/{id}")
async def delete_estoque(id: int, _id_user_acao: int = Depends(jwt_estoquista), session: Session = Depends(get_sesion)):
    """\n Deletar o estoque \
    \n Essa rota pertence somente ao estoquista."""
    log.criar_log(session=session, acao=f"Estoque deletada: {id}", id=_id_user_acao, tb_acao="Estoque")

    return estoque.excluir_estoque(session, id)

@router.patch("/{id}")
async def atualizar_estoque(id: int, base: BaseEstoque.EstoqueUpdateSchema, _id_user_acao: int = Depends(jwt_estoquista), session: Session = Depends(get_sesion)):
    """\n Atualizar estoque \
    \n Essa rota pertence somente ao estoquista."""

    log.criar_log(session=session, acao=f"Estoque alterado: {id}", id=_id_user_acao, tb_acao="Estoque")

    return estoque.atualizar_estoque(session,id , base)
