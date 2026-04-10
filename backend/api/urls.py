from django.urls import path
from .views import (
    PlotMetricsView,
    MeasurementListCreateView,
    MeasurementRetrieveUpdateDeleteView,
)

urlpatterns = [
    path('calc/metrics', PlotMetricsView.as_view(), name='plot-metrics'),
    path('records', MeasurementListCreateView.as_view(), name='measurement-list-create'),
    path('records/<int:pk>', MeasurementRetrieveUpdateDeleteView.as_view(), name='measurement-rud'),
]