from rest_framework import serializers
from .models import Plantacion, Medicion, ArbolMedido


class PlantacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantacion
        fields = '__all__'

class MedicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicion
        fields = '__all__'

class ArbolMedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArbolMedido
        fields = '__all__'



