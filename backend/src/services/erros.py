from fastapi import HTTPException
from sqlalchemy.orm import Session

class ErroInesperado(HTTPException):
    def __init__(self, e, session: Session | None = None):
        if session is not None:
            session.rollback()

        super().__init__(
            status_code=500,
            detail=f"Erro inesperado do servidor.Erro -> {e}."
        )

#region jwt
class ErroJwtInvalido(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="JWT inválido."
        )
#endregion

#region user
class ErroUserNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Esse usuario não foi encontrado."
        )

class ErroUserExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Esse usuario já existe."
        )
#endregion

#region categoria 
class ErroCategoriaNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa categoria não foi encontrado."
        )

class ErroCategoriaExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa categoria já existe."
        )
#endregion

#region contrato
class ErroContratoNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa contrato não foi encontrado."
        )

class ErroContratoExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa contrato já existe."
        )
#endregion

#region unidade
class ErroUnidadeNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa unidade não foi encontrado."
        )

class ErroUnidadeExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa unidade já existe."
        )
#endregion

#region solicitacao
class ErroSolicitacaoNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa solicitaca não foi encontrado."
        )

class ErroSolicitacaoExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa solicitaca já existe."
        )
#endregion

#region produto
class ErroProdutoNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa produto não foi encontrado."
        )

class ErroProdutoExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa produto já existe."
        )
#endregion

#region fornecedor
class ErroFornecedorNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa fornecedor não foi encontrado."
        )

class ErroFornecedorExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa fornecedor já existe."
        )
#endregion

#region estoque
class ErroEstoqueNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa estoque não foi encontrado."
        )

class ErroEstoqueExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa estoque já existe."
        )
#endregion

#region departamento
class ErroDepartamentoNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa departamento não foi encontrado."
        )

class ErroDepartamentoExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa departamento já existe."
        )
#endregion

