#!/bin/sh

#aplica a migrate do Django de forma silenciosa e sem o Django pedir qualquer tipo de input
python manage.py migrate --noinput --verbosity 0

#devolver o controle para o Dockerfile após a execução desse script
exec "$@"