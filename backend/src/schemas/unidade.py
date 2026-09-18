from pydantic import BaseModel

class UnidadeSchema(BaseModel):
    nome: str

class UnidadeReadSchema(BaseModel):
    id: int
    nome: str