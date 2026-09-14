from fastapi.responses import RedirectResponse
from fastapi import APIRouter
from ..schemas.geral import Reposne500

route_manager = APIRouter(
    #Respostas para todas rotas que "Depende" de route_manager
    responses={
        422:{"description":"Parâmetro invalido no Body da requisição"},
        500:{"description":"Erro interno no servidor",
             "model":Reposne500}
    }
)

#include_in_schema -> não mostrar no /docs ou o /redoc
@route_manager.get("/",include_in_schema=False)
async def home_to_doc():
    #Toda vez que o usuário acessar essa rota, ele será redirecionado automaticamente para /docs.
    return RedirectResponse(url='/docs')

