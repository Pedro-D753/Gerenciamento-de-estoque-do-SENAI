from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..dependencies import get_sesion, jwt_admin
from ..schemas.excel import TabelasExportacaoSchema
from ..services import excel, log

router = APIRouter(
    prefix="/exportacoes",
    tags=["Exportações"],
)


def _resposta_excel(arquivo) -> StreamingResponse:
    return StreamingResponse(
        arquivo,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{excel.nome_arquivo()}"'
            )
        },
    )


@router.get("/todas")
async def exportar_todas_tabelas(
    id_user_acao: int = Depends(jwt_admin),
    session: Session = Depends(get_sesion),
):
    tabelas = excel.listar_tabelas()
    arquivo = excel.exportar_tabelas(session, tabelas)

    log.criar_log(
        session=session,
        acao="Exportar todas as tabelas",
        id=id_user_acao,
        tb_acao="Exportação",
    )

    return _resposta_excel(arquivo)


@router.post("/tabelas")
async def exportar_tabelas_especificas(
    base: TabelasExportacaoSchema,
    id_user_acao: int = Depends(jwt_admin),
    session: Session = Depends(get_sesion),
):
    arquivo = excel.exportar_tabelas(session, base.tabelas)

    log.criar_log(
        session=session,
        acao=f"Exportar tabelas específicas: {', '.join(base.tabelas)}",
        id=id_user_acao,
        tb_acao="Exportação",
    )

    return _resposta_excel(arquivo)
