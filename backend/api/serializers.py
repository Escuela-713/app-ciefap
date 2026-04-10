from rest_framework import serializers
from .models import Producer, Species, Plot, Tree, Measurement


class ProducerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producer
        fields = ['id', 'name']


class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ['id', 'name', 'biomass_above_a', 'biomass_above_b', 'root_ratio']


class TreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tree
        fields = ['id', 'number', 'dap_cm', 'height_m']


class PlotSerializer(serializers.ModelSerializer):
    producer = ProducerSerializer(read_only=True)
    species = SpeciesSerializer(read_only=True)
    trees = TreeSerializer(many=True, read_only=True)

    class Meta:
        model = Plot
        fields = [
            'id', 'producer', 'species', 'site_class',
            'distance_in_row_m', 'distance_between_rows_m',
            'radius_m', 'age_years', 'dominant_height_m',
            'trees'
        ]


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = ['id', 'plot', 'input_data', 'metrics', 'created_at']