from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # Path del paquete de la app
    name = 'api'
    # Conservamos la etiqueta 'ciefap' para no romper el historial de migraciones
    label = 'ciefap'
