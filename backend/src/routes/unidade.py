from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_sesion, jwt_admin, jwt_geral
from ..services import unidade, log
from ..schemas import unidade as BaseUnidade

router = APIRouter(
    prefix='/unidades',
    tags=["Unidade"],

    responses={
        404:{"description":"Essa unidade não foi encontrado."}
    }
)

@router.get("/")
async def pega_unidade(_id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas todas as unidades criadas \
    \n Essa rota tem que está logado."""

    log.criar_log(session=session, acao="ler unidade", id=_id_user_acao, tb_acao="Unidade")

    return unidade.ler_unidade(session)


@router.get("/{id}")
async def pega_unidade_id(id: int, _id_user_acao: int = Depends(jwt_geral), session: Session = Depends(get_sesion)):
    """\n Pegas a unidade criada com base no id \
    \n Essa rota tem que está logado."""

    log.criar_log(session=session, acao="ler unidade pelo id", id=_id_user_acao, tb_acao="Unidade")
    
    return unidade.ler_unidade_id(session, id)

@router.post("/")
async def criar_unidade(base: BaseUnidade.UnidadeSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Criar unidade \
    \n Essa rota pertence somente ao admin."""
    
    log.criar_log(session=session, acao=f"Unidade Criada: {base.nome}", id=_id_user_acao, tb_acao="Unidade")
    
    return unidade.criar_unidade(session, base)

@router.delete("/{id}")
async def delete_unidade(id: int, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Deletar o unidade \
    \n Essa rota pertence somente ao admin."""
    
    log.criar_log(session=session, acao=f"Unidade deletada: {id}", id=_id_user_acao, tb_acao="Unidade")
    
    return unidade.excluir_unidade(session, id)

@router.patch("/{id}")
async def atualizar_unidade(id: int, base: BaseUnidade.UnidadeSchema, _id_user_acao: int = Depends(jwt_admin), session: Session = Depends(get_sesion)):
    """\n Atualizar unidade \
    \n Essa rota pertence somente ao admin."""
    
    log.criar_log(session=session, acao=f"Unidade alterada: {id}", id=_id_user_acao, tb_acao="Unidade")

    return unidade.atualizar_unidade(session,id , base)

