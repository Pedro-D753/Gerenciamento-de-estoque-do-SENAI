from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

class ErroInesperado(HTTPException):
    def __init__(self, e, session: Session | None = None):
        if session is not None:
            session.rollback()

        original_error = getattr(e, "orig", None)
        if isinstance(e, IntegrityError) and getattr(original_error, "pgcode", None) == "23503":
            super().__init__(
                status_code=409,
                detail="Não é possível realizar a operação: há registros vinculados ou uma referência inválida."
            )
            return

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

class ErroJwtInvalidoEmail(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
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

#region imagem
class ErroImagemInvalida(HTTPException):
    def __init__(self, detalhe: str, status_code: int = 422):
        super().__init__(status_code=status_code, detail=detalhe)


class ErroImagemNaoEncontrada(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="Esse produto não possui imagem.")


class ErroStorageIndisponivel(HTTPException):
    def __init__(self, e=None):
        super().__init__(
            status_code=502,
            detail=f"Serviço de armazenamento de imagens indisponível. Erro -> {e}",
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

#region registro
class ErroRegistroNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa registro não foi encontrado."
        )

class ErroRegistroExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa registro já existe."
        )
#endregion

#region estoque solicitado
class ErroEstoqueSolicitadoExiste(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=409,
            detail="Essa solicitacao de estoque já existe."
        )

class ErroEstoqueSolicitadoNaoEncontrado(HTTPException):
    def __init__(self, session: Session):
        session.rollback()
        super().__init__(
            status_code=404,
            detail="Essa solicitacao não foi encontrado."
        )
#endregion

#region email
class AutStmpServer(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=501,
            detail="Erro de autenticação no serviço de email."
            )

class StmpIndisponivel(HTTPException):
    def __init__(self, session: Session):
        session.rollback()

        super().__init__(
            status_code=503,
            detail="Serviço de email indisponível."
        )
#endregion
