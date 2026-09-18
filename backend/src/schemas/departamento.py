from pydantic import BaseModel

class DepartamentoSchema(BaseModel):
    nome: str

class DepartamentoReadSchema(BaseModel):
    id: int
    nome: str