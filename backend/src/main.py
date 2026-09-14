from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.route_manager import route_manager as rm

app = FastAPI(
    title="Api para o Sistema de Gerenciamento de Estoque do SENAI",
    description="Esse sistema foi desenvolvido pelos alunos do 3º ano do Ensino Médio, \n  \
    no itinerário de Desenvolvimento de Sistemas de 2026, com o objetivo de gerenciar o estoque da instituição. \n \
    \nPara Mais informação acesse a [Github do projeto](https://github.com/Pedro-D753/Gerenciamento-de-estoque-do-SENAI)."
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(rm)