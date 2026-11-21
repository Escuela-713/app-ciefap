from django.contrib import admin
from .models import Plantacion, Medicion, ArbolMedido

admin.site.register(Plantacion)
admin.site.register(Medicion)
admin.site.register(ArbolMedido)