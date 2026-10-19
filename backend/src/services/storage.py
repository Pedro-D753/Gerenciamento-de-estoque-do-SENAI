import hashlib
import threading
from io import BytesIO

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from PIL import Image, UnidentifiedImageError

from ..config import MINIO_ACCESS_KEY, MINIO_BUCKET, MINIO_ENDPOINT, MINIO_SECRET_KEY
from .erros import ErroImagemInvalida, ErroImagemNaoEncontrada, ErroStorageIndisponivel

TAMANHO_MAX = 5 * 1024 * 1024
FORMATOS_IMAGEM = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
_NAO_ENCONTRADO = ("404", "NoSuchKey", "NoSuchBucket", "NotFound")

_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name="us-east-1",
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
        connect_timeout=3,
        read_timeout=15,
        retries={"max_attempts": 4, "mode": "standard"},
    ),
)

_bucket_ok = False
_bucket_lock = threading.Lock()


def _key(img_hash: str) -> str:
    return f"produtos/{img_hash}"


def _codigo(e: ClientError) -> str:
    return e.response.get("Error", {}).get("Code", "")


def _detectar_tipo(dados: bytes) -> str | None:
    try:
        with Image.open(BytesIO(dados)) as imagem:
            tipo = FORMATOS_IMAGEM.get(imagem.format)
            if tipo is None:
                return None
            imagem.verify()
            return tipo
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        return None


def garantir_bucket() -> None:
    global _bucket_ok
    if _bucket_ok:
        return

    with _bucket_lock:
        if _bucket_ok:
            return
        try:
            _client.head_bucket(Bucket=MINIO_BUCKET)
        except ClientError as e:
            if _codigo(e) not in _NAO_ENCONTRADO:
                raise
            try:
                _client.create_bucket(Bucket=MINIO_BUCKET)
            except ClientError as e2:
                if _codigo(e2) not in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
                    raise
        _bucket_ok = True


def _objeto_existe(img_hash: str) -> bool:
    try:
        _client.head_object(Bucket=MINIO_BUCKET, Key=_key(img_hash))
        return True
    except ClientError as e:
        if _codigo(e) in _NAO_ENCONTRADO:
            return False
        raise


def salvar_imagem(dados: bytes) -> str:
    tipo = _detectar_tipo(dados)
    if tipo is None:
        raise ErroImagemInvalida("Formato não suportado. Envie uma imagem JPEG, PNG ou WEBP.")

    img_hash = hashlib.sha256(dados).hexdigest()
    try:
        garantir_bucket()
        if not _objeto_existe(img_hash):
            _client.put_object(
                Bucket=MINIO_BUCKET,
                Key=_key(img_hash),
                Body=dados,
                ContentType=tipo,
            )
    except (ClientError, BotoCoreError) as e:
        raise ErroStorageIndisponivel(e)
    return img_hash


def abrir_imagem(img_hash: str):
    try:
        obj = _client.get_object(Bucket=MINIO_BUCKET, Key=_key(img_hash))
    except ClientError as e:
        if _codigo(e) in _NAO_ENCONTRADO:
            raise ErroImagemNaoEncontrada()
        raise ErroStorageIndisponivel(e)
    except BotoCoreError as e:
        raise ErroStorageIndisponivel(e)
    return obj["Body"], obj["ContentType"], obj["ContentLength"]


def iterar(body, tamanho_chunk: int = 64 * 1024):
    try:
        yield from body.iter_chunks(tamanho_chunk)
    finally:
        body.close()


def excluir_imagem(img_hash: str) -> None:
    try:
        _client.delete_object(Bucket=MINIO_BUCKET, Key=_key(img_hash))
    except (ClientError, BotoCoreError) as e:
        raise ErroStorageIndisponivel(e)


def etag_confere(if_none_match: str | None, img_hash: str) -> bool:
    if not if_none_match:
        return False
    if if_none_match.strip() == "*":
        return True
    candidatos = [c.strip().removeprefix("W/").strip('"') for c in if_none_match.split(",")]
    return img_hash in candidatos
