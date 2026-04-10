from django.db import models


class Producer(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name


class Species(models.Model):
    name = models.CharField(max_length=120)
    # Coeficientes opcionales para biomasa/volumen (si se desean calibraciones por especie)
    biomass_above_a = models.FloatField(null=True, blank=True)
    biomass_above_b = models.FloatField(null=True, blank=True)
    root_ratio = models.FloatField(null=True, blank=True, help_text="Relación raíz/aérea")

    def __str__(self):
        return self.name


class SiteClass(models.TextChoices):
    I = 'I', 'I'
    II = 'II', 'II'
    III = 'III', 'III'


class Plot(models.Model):
    producer = models.ForeignKey(Producer, on_delete=models.SET_NULL, null=True, blank=True)
    species = models.ForeignKey(Species, on_delete=models.SET_NULL, null=True, blank=True)
    site_class = models.CharField(max_length=3, choices=SiteClass.choices, blank=True)

    distance_in_row_m = models.FloatField(default=0)
    distance_between_rows_m = models.FloatField(default=0)
    radius_m = models.FloatField(default=0, help_text="Radio de parcela, si aplica")
    age_years = models.PositiveIntegerField(default=0)
    dominant_height_m = models.FloatField(default=0)

    def __str__(self):
        return f"Parcela #{self.pk} - {self.species or 'Sin especie'}"


class Tree(models.Model):
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, related_name='trees')
    number = models.PositiveIntegerField(default=0)
    dap_cm = models.FloatField()
    height_m = models.FloatField()

    def __str__(self):
        return f"Árbol {self.number} (DAP {self.dap_cm} cm)"


class Measurement(models.Model):
    plot = models.ForeignKey(Plot, on_delete=models.SET_NULL, null=True, blank=True, related_name='measurements')
    # Datos que llegan del frontend: árboles, distancias, área, edad, site index/altura dominante, etc.
    input_data = models.JSONField()
    # Métricas calculadas (por árbol y agregadas por ha) que el frontend ya calculó o que el backend recalcula.
    metrics = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Measurement #{self.pk} - {self.created_at:%Y-%m-%d %H:%M}"
