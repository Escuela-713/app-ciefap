from django.urls import path
from .views import (
    PlotMetricsView,
    MeasurementListCreateView,
    MeasurementRetrieveUpdateDeleteView,
    calcular_basal_area,
    calcular_diametro_altura_pecho,
    calcular_volumen_total_cc,
    calcular_volumen_total_sc,
    calcular_volumen_maderable_cc,
    calcular_volumen_maderable_sc,
    calcular_biomasa_aerea_total,
    calcular_biomasa_raiz,
    calcular_biomasa_total
)

urlpatterns = [
    path('calc/metrics', PlotMetricsView.as_view(), name='plot-metrics'),
    path('records', MeasurementListCreateView.as_view(), name='measurement-list-create'),
    path('records/<int:pk>', MeasurementRetrieveUpdateDeleteView.as_view(), name='measurement-rud'),

path('basal-area/', calcular_basal_area, name='basal-area'),
path('diametro-altura-pecho/', calcular_diametro_altura_pecho, name='diametro-altura-pecho'),
path('volumen-total-cc/', calcular_volumen_total_cc, name='volumen-total-cc'),
path('volumen-total-sc/', calcular_volumen_total_sc, name='volumen-total-sc'),
path('volumen-maderable-cc/', calcular_volumen_maderable_cc, name='volumen-maderable-cc'),
path('volumen-maderable-sc/', calcular_volumen_maderable_sc, name='volumen-maderable-sc'),
path('biomasa-aerea-total/', calcular_biomasa_aerea_total, name='biomasa-aerea-total'),
path('biomasa-raiz/', calcular_biomasa_raiz, name='biomasa-raiz'),
path('biomasa-total/', calcular_biomasa_total, name='biomasa-total'),
]