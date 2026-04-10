from django.contrib import admin
from .models import Producer, Species, Plot, Tree, Measurement


@admin.register(Producer)
class ProducerAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "root_ratio")
    search_fields = ("name",)


@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ("id", "producer", "species", "site_class", "age_years")
    list_filter = ("site_class", "species")


@admin.register(Tree)
class TreeAdmin(admin.ModelAdmin):
    list_display = ("id", "plot", "number", "dap_cm", "height_m")
    list_filter = ("plot",)


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ("id", "plot", "created_at")
    list_filter = ("plot",)
