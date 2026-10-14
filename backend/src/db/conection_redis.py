import redis
from ..config import DB_PASSWORD, DB_HOST

redis_conection = redis.Redis(
    #FIXME - ajustar para rede docker depois
    host=DB_HOST, 
    port=6379, 
    password=DB_PASSWORD,
    decode_responses=True
)