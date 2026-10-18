import redis
from ..config import DB_PASSWORD_REDIS, REDIS_HOST

redis_conection = redis.Redis(
    host=REDIS_HOST,
    port=6379,
    password=DB_PASSWORD_REDIS,
    decode_responses=True
)
