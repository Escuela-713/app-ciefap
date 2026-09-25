from django.urls import path
from .views import (
    PlotMetricsView,
    MeasurementListCreateView,
    MeasurementRetrieveUpdateDeleteView,
    calcular_basal_area
)

urlpatterns = [
    path('calc/metrics', PlotMetricsView.as_view(), name='plot-metrics'),
    path('records', MeasurementListCreateView.as_view(), name='measurement-list-create'),
    path('records/<int:pk>', MeasurementRetrieveUpdateDeleteView.as_view(), name='measurement-rud'),

path('basal-area/', calcular_basal_area, name='basal-area'),
]