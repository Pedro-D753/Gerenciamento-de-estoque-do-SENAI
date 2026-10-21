from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from os import getenv
from .models import initialize_database
from .routes.route_manager import route_manager as rm


@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Api para o Sistema de Gerenciamento de Estoque do SENAI",
    description="Esse sistema foi desenvolvido pelos alunos do 3º ano do Ensino Médio, \n  \
    no itinerário de Desenvolvimento de Sistemas de 2026, com o objetivo de gerenciar o estoque da instituição. \n \
    \nPara Mais informação acesse a [Github do projeto](https://github.com/Pedro-D753/Gerenciamento-de-estoque-do-SENAI).",
    version="1.0.0",
    lifespan=lifespan,
)

# O frontend pode ser executado tanto em localhost quanto em 127.0.0.1.
# As origens precisam ser explícitas quando allow_credentials está habilitado.
origens_frontend = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
origens_frontend.extend(
    origem.strip()
    for origem in getenv("FRONTEND_PUBLIC_ORIGINS", "").split(",")
    if origem.strip()
)

cors_config = {
    "allow_origins": origens_frontend,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

app.include_router(rm)

# Envolve a aplicação inteira para que erros 500 também recebam os cabeçalhos CORS.
app = CORSMiddleware(app, **cors_config)