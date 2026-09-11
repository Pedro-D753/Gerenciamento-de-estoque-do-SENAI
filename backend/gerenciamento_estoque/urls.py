"""
URL configuration for gerenciamento_estoque project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from drf_spectacular.views import SpectacularAPIView,SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    

    # schema.yml contém todas as informações de rotas do projeto para o Swagger/Redoc.
    # Caminho para o download do schema.yml.
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

]