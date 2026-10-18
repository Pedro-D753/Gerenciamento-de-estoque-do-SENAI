from pydantic import BaseModel, Field
from typing import Literal


class TabelasExportacaoSchema(BaseModel):
    tabelas: list[
        Literal[
            "categoria",
            "contrado",
            "estoque",
            "estoque_solicitacao",
            "fornecedor",
            "log",
            "produto",
            "registro",
            "solicitacao",
            "unidade",
            "user",
        ]
    ] = Field(min_length=1)
