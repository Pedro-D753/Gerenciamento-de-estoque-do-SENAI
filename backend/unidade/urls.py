from django.urls import path, include
from .views import UnidadeViewSet
from rest_framework.routers import DefaultRouter

#Rotas gerais relacionadas à unidade.
router = DefaultRouter()
router.register(r'unidade', UnidadeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]