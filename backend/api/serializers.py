from rest_framework import serializers
from .models import Plantacion, Medicion, ArbolMedido

class InputPlantacionSerializer(serializers.Serializer):
    dis_arboles_fila = serializers.FloatField(min_value=0.01)
    dis_arboles_entre_fila = serializers.FloatField(min_value=0.01)
    cantidad_arboles = serializers.IntegerField(min_value=1)

class InputArbolMedidoSerializer(serializers.Serializer):
    dap_cm = serializers.FloatField(min_value=0.1)
    height_m = serializers.FloatField(min_value=0.1)

class InputMedicionSerializer(serializers.Serializer):
    fecha = serializers.CharField(max_length=45)
    edad = serializers.FloatField(min_value=1)
    arboles = InputArbolMedidoSerializer(many=True, min_length=1)


class PlantacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantacion
        fields = '__all__'
