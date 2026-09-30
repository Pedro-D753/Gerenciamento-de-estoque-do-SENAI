from .produto import router as produto_router 
from .derpartamento import router as departamento_router
from .categoria import router as categoria_router 
from .contrato import router as contrato_router 
from .fornecedor import router as fornecedor_router 
from .estoque import router as estoque_router  
from .solicitacao import router as solicitacao_router  
from .unidade import router as unidade_router  
from .user import router as user_router 
from .estoque import router as estoque_router 
from .registro import router as registro_router 

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

route_manager.include_router(categoria_router) 
route_manager.include_router(contrato_router) 
route_manager.include_router(departamento_router) 
route_manager.include_router(estoque_router) 
route_manager.include_router(fornecedor_router) 
route_manager.include_router(produto_router) 
route_manager.include_router(registro_router) 
route_manager.include_router(solicitacao_router) 
route_manager.include_router(unidade_router) 
route_manager.include_router(user_router) 
route_manager.include_router(estoque_router) 
