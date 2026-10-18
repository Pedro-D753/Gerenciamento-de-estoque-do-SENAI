from datetime import date
from io import BytesIO

import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import Base


def listar_tabelas() -> list[str]:
    return sorted(Base.metadata.tables.keys())


def validar_tabelas(tabelas: list[str]) -> list[str]:
    tabelas_disponiveis = set(listar_tabelas())
    tabelas_invalidas = [
        tabela for tabela in tabelas if tabela not in tabelas_disponiveis
    ]

    if tabelas_invalidas:
        raise HTTPException(
            status_code=404,
            detail={
                "mensagem": "Uma ou mais tabelas não foram encontradas.",
                "tabelas_invalidas": tabelas_invalidas,
            },
        )

    return tabelas


def exportar_tabelas(session: Session, tabelas: list[str]) -> BytesIO:
    tabelas_validadas = validar_tabelas(tabelas)
    arquivo = BytesIO()

    with pd.ExcelWriter(arquivo, engine="openpyxl") as escritor:
        for tabela in tabelas_validadas:
            dados = pd.read_sql_table(
                tabela,
                session.connection(),
            )
            dados.to_excel(
                escritor,
                sheet_name=tabela,
                index=False,
            )

    arquivo.seek(0)
    return arquivo


def nome_arquivo() -> str:
    return f"SGE_dados_deate_{date.today().isoformat()}.xlsx"
