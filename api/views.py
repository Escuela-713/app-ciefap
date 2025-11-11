from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from .calculations import (
    basal_area_m2,
    volume_total_cc_m3,
    volume_total_sc_m3,
    volume_merchantable15_cc_m3,
    volume_merchantable15_sc_m3,
    biomass_above_kg,
    biomass_root_kg,
    aggregate_plot_metrics,
    dominant_height_from_site_index,
    site_index_from_dominant_height,
    recommended_plot_area_m2,
    plot_radius_from_area_m,
    carbon_forest_tn_per_ha,
    capture_kg_per_day_per_ha,
    animals_per_ha_equilibrium,
)
from .models import Measurement, Plot
from .serializers import MeasurementSerializer


class PlotMetricsView(APIView):
    def post(self, request):
        data = request.data or {}
        trees = data.get("trees", [])
        dist_in_row_m = float(data.get("distance_in_row_m", 0))
        dist_between_rows_m = float(data.get("distance_between_rows_m", 0))
        plot_area_m2 = float(data.get("plot_area_m2", 0))
        min_trees_for_plot = int(data.get("min_trees_for_plot", 20))
        age_years = float(data.get("age_years", 0))
        animal_emission_kg_day = float(data.get("animal_emission_kg_day", 5.0))
        site_index_m = data.get("site_index_m")
        dominant_height_m_input = data.get("dominant_height_m")
        root_ratio = float(data.get("species_root_ratio", 0.263))

        # Validación mínima
        if not isinstance(trees, list) or len(trees) == 0:
            return Response({"detail": "Debe proporcionar una lista 'trees' con dap_cm y height_m."}, status=status.HTTP_400_BAD_REQUEST)

        # Cálculo por árbol
        per_tree = []
        for t in trees:
            dap = float(t.get("dap_cm", 0))
            h = float(t.get("height_m", 0))
            b_above = biomass_above_kg(dap, h)
            b_root = biomass_root_kg(b_above, root_ratio)
            per_tree.append({
                "dap_cm": dap,
                "height_m": h,
                "ab_m2": round(basal_area_m2(dap), 4),
                "vol_total_cc_m3": round(volume_total_cc_m3(dap, h), 4),
                "vol_total_sc_m3": round(volume_total_sc_m3(dap, h), 4),
                "vol_maderable15_cc_m3": round(volume_merchantable15_cc_m3(dap, h), 4),
                "vol_maderable15_sc_m3": round(volume_merchantable15_sc_m3(dap, h), 4),
                "biomass_above_kg": round(b_above, 3),
                "biomass_root_kg": round(b_root, 3),
                "biomass_total_kg": round(b_above + b_root, 3),
            })

        # Agregados de parcela / hectárea
        agg = aggregate_plot_metrics(
            trees,
            dist_in_row_m,
            dist_between_rows_m,
            plot_area_m2=plot_area_m2,
            age_years=age_years,
            animal_emission_kg_day=animal_emission_kg_day,
            root_ratio=root_ratio,
        )

        # Site index / dominant height
        dominant_height_calc = None
        site_index_calc = None
        if site_index_m is not None and age_years:
            try:
                dominant_height_calc = round(
                    dominant_height_from_site_index(float(site_index_m), age_years), 2
                )
            except Exception:
                dominant_height_calc = None
        if dominant_height_m_input is not None and age_years:
            try:
                site_index_calc = round(
                    site_index_from_dominant_height(float(dominant_height_m_input), age_years), 2
                )
            except Exception:
                site_index_calc = None

        # Parcela recomendada para mínimo de árboles y radio
        recommended_area_m2 = recommended_plot_area_m2(dist_in_row_m, dist_between_rows_m, min_trees_for_plot)
        recommended_radius_m = plot_radius_from_area_m(recommended_area_m2)
        radius_from_provided_area_m = plot_radius_from_area_m(plot_area_m2) if plot_area_m2 else None

        # Carbono y equilibrio animales/ha
        c_bosque_tn_ha = carbon_forest_tn_per_ha(agg["biomass_total_tn_per_ha"]) if agg.get("biomass_total_tn_per_ha") is not None else 0.0
        capture_kg_day_ha = capture_kg_per_day_per_ha(c_bosque_tn_ha, age_years) if age_years else 0.0
        animals_equilibrium = animals_per_ha_equilibrium(capture_kg_day_ha, animal_emission_kg_day) if animal_emission_kg_day else 0.0

        return Response({
            "per_tree": per_tree,
            "aggregates": agg,
            "site": {
                "dominant_height_from_site_index_m": dominant_height_calc,
                "site_index_from_dominant_height_m": site_index_calc,
                "age_years": age_years,
            },
            "plot": {
                "recommended_area_m2_for_min_trees": round(recommended_area_m2, 2),
                "recommended_radius_m": round(recommended_radius_m, 2),
                "provided_area_m2": plot_area_m2 if plot_area_m2 else None,
                "radius_from_provided_area_m": round(radius_from_provided_area_m, 2) if radius_from_provided_area_m else None,
                "min_trees_for_plot": min_trees_for_plot,
            },
            "carbon": {
                "c_bosque_tn_per_ha": round(c_bosque_tn_ha, 2),
                "capture_kg_per_day_per_ha": round(capture_kg_day_ha, 3),
                "animal_emission_kg_day": animal_emission_kg_day,
                "animals_per_ha_equilibrium": round(animals_equilibrium, 2),
            },
        }, status=status.HTTP_200_OK)


class MeasurementListCreateView(generics.ListCreateAPIView):
    queryset = Measurement.objects.all().order_by('-created_at')
    serializer_class = MeasurementSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data or {}
        input_data = payload.get('input_data')
        metrics = payload.get('metrics')
        plot_id = payload.get('plot_id')

        # Si no se envían metrics, los calculamos con los datos provistos
        if not metrics and input_data:
            trees = input_data.get('trees', [])
            dist_in_row_m = float(input_data.get('distance_in_row_m', 0))
            dist_between_rows_m = float(input_data.get('distance_between_rows_m', 0))
            plot_area_m2 = float(input_data.get('plot_area_m2', 0))
            age_years = float(input_data.get('age_years', 0))
            animal_emission_kg_day = float(input_data.get('animal_emission_kg_day', 5.0))
            root_ratio = float(input_data.get('species_root_ratio', 0.263))
            metrics = aggregate_plot_metrics(
                trees,
                dist_in_row_m,
                dist_between_rows_m,
                plot_area_m2=plot_area_m2,
                age_years=age_years,
                animal_emission_kg_day=animal_emission_kg_day,
                root_ratio=root_ratio,
            )

        plot = Plot.objects.filter(pk=plot_id).first() if plot_id else None
        measurement = Measurement.objects.create(plot=plot, input_data=input_data, metrics=metrics)
        serializer = self.get_serializer(measurement)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MeasurementRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Measurement.objects.all()
    serializer_class = MeasurementSerializer
