from rest_framework import viewsets
from .models import UnidadeModels
from .serializers import UnidadeSerializer

#Classe que cria automaticamente todas as rotas REST com base no modelo do banco.
class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = UnidadeModels.objects.all()
    serializer_class = UnidadeSerializer