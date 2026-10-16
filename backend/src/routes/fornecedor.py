from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import fornecedor
from ..schemas import fornecedor as BaseFornecedor

router = APIRouter(
    prefix='/fornecedors',
    tags=["Fornecedor"],

    responses={
        404:{"description":"Essa fornecedor não foi encontrado."}
    }
)

@router.get("/")
async def pega_fornecedor(_: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as fornecedors criadas  \
    \n Essa rota tem que está logado."""
    return fornecedor.ler_fornecedor(session)


@router.get("/{id}")
async def pega_fornecedor_id(id: int, _: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a fornecedor criada com base no id  \
    \n Essa rota tem que está logado."""
    return fornecedor.ler_fornecedor_id(session, id)

@router.post("/")
async def criar_fornecedor(base: BaseFornecedor.FornecedorSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar fornecedor \
    \n Essa rota pertence somente ao admin."""
    return fornecedor.criar_fornecedor(session, base)

@router.delete("/{id}")
async def delete_fornecedor(id: int, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o fornecedor \
    \n Essa rota pertence somente ao admin."""
    return fornecedor.excluir_fornecedor(session, id)

@router.patch("/{id}")
async def atualizar_fornecedor(id: int, base: BaseFornecedor.FornecedorUpdateSchema, _: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar fornecedor \
    \n Essa rota pertence somente ao admin."""

    return fornecedor.atualizar_fornecedor(session, id, base)

