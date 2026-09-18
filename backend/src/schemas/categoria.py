from pydantic import BaseModel

class CategoriaSchema(BaseModel):
    nome: str

class CategoriaReadSchema(BaseModel):
    id: int
    nome: str