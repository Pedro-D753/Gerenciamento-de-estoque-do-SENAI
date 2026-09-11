from rest_framework import serializers
from .models import UnidadeModels

#Transforma os dados HTTP para uso no Python e no Django.
class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadeModels
        fields = '__all__'