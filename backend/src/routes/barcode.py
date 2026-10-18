import json
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..db.conection_redis import redis_conection
from ..dependencies import jwt_geral

router = APIRouter(prefix="/barcode", tags=["Barcode"])
SESSION_TTL_SECONDS = 300


class BarcodeResult(BaseModel):
    value: str = Field(min_length=1, max_length=128)


def session_key(session_id: str) -> str:
    return f"barcode:session:{session_id}"


@router.post("/sessions")
def create_barcode_session(_: int = Depends(jwt_geral)):
    session_id = uuid4().hex
    redis_conection.setex(
        session_key(session_id),
        SESSION_TTL_SECONDS,
        json.dumps({"status": "waiting", "value": None}),
    )
    return {"session_id": session_id, "expires_in": SESSION_TTL_SECONDS}


@router.post("/sessions/{session_id}/result")
def submit_barcode_result(session_id: str, result: BarcodeResult):
    key = session_key(session_id)
    current = redis_conection.get(key)
    if current is None:
        raise HTTPException(status_code=404, detail="Sessão de leitura expirada ou inexistente.")
    value = result.value.strip()
    if not value:
        raise HTTPException(status_code=422, detail="O código de barras não pode ficar vazio.")

    payload = json.loads(current)
    if payload.get("status") == "completed":
        raise HTTPException(status_code=409, detail="Esta sessão já recebeu um código.")
    payload.update({"status": "completed", "value": value})
    redis_conection.setex(key, max(redis_conection.ttl(key), 1), json.dumps(payload))
    return {"message": "Código recebido."}


@router.get("/sessions/{session_id}")
def get_barcode_session(session_id: str, _: int = Depends(jwt_geral)):
    current = redis_conection.get(session_key(session_id))
    if current is None:
        raise HTTPException(status_code=404, detail="Sessão de leitura expirada ou inexistente.")
    return json.loads(current)
