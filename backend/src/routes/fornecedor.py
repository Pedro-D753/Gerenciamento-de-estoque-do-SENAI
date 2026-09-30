from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion
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
async def pega_fornecedor(session: Session = Depends(get_sesion)):
    """\n Pegas todas as fornecedors criadas"""
    return fornecedor.ler_fornecedor(session)


@router.get("/{id}")
async def pega_fornecedor_id(id: int, session: Session = Depends(get_sesion)):
    """\n Pegas a fornecedor criada com base no id"""
    return fornecedor.ler_fornecedor_id(session, id)

@router.post("/")
async def criar_fornecedor(base: BaseFornecedor.FornecedorSchema, session: Session = Depends(get_sesion)):
    """\n Criar fornecedor"""
    return fornecedor.criar_fornecedor(session, base)

@router.delete("/{id}")
async def delete_fornecedor(id: int, session: Session = Depends(get_sesion)):
    """\n Deletar o fornecedor"""
    return fornecedor.excluir_fornecedor(session, id)

@router.patch("/{id}")
async def atualizar_fornecedor(id: int, base: BaseFornecedor.FornecedorUpdateSchema, session: Session = Depends(get_sesion)):
    """\n Atualizar fornecedor"""

    return fornecedor.atualizar_fornecedor(session, id, base)


