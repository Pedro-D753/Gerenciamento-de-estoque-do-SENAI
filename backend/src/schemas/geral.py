from pydantic import BaseModel

class ResponseOk(BaseModel): 
    mensagem : str

class Reposne500(BaseModel):
    detalie : str = "Erro inesperado do servidor. Erro -> {erro}"