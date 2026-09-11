from django.db import models

# Crie seus modelos aqui.
class UnidadeModels(models.Model):
    #O Django já cria automaticamente o id (primary Key).
    
    nome = models.CharField(max_length=50, unique=True)
