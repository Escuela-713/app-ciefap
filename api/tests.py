from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase

from .calculations import (
    basal_area_m2,
    volume_total_cc_m3,
    volume_total_sc_m3,
    volume_merchantable15_cc_m3,
    volume_merchantable15_sc_m3,
    biomass_above_kg,
    biomass_root_kg,
    trees_per_hectare,
    dominant_height_from_site_index,
    site_index_from_dominant_height,
)


class CalculationsUnitTests(TestCase):
    def test_basal_area_m2_30cm(self):
        area = basal_area_m2(30.0)
        self.assertAlmostEqual(area, 0.07068583470577035, places=12)

    def test_volumes_30cm_20m(self):
        vt_cc = volume_total_cc_m3(30.0, 20.0)
        vt_sc = volume_total_sc_m3(30.0, 20.0)
        self.assertAlmostEqual(vt_cc, 0.60324, places=5)
        self.assertAlmostEqual(vt_sc, 0.56076, places=5)

    def test_volume_merchantable15_sc_ratio(self):
        dap = 30.0
        h = 20.0
        vm_cc = volume_merchantable15_cc_m3(dap, h)
        vm_sc = volume_merchantable15_sc_m3(dap, h)
        ratio = volume_total_sc_m3(dap, h) / volume_total_cc_m3(dap, h)
        self.assertAlmostEqual(vm_sc, vm_cc * ratio, places=5)

    def test_biomass_above_and_root(self):
        dap = 30.0
        h = 20.0
        b_above = biomass_above_kg(dap, h)
        b_root = biomass_root_kg(b_above, 0.263)
        self.assertGreater(b_above, 0.0)
        self.assertAlmostEqual(b_root, b_above * 0.263, places=6)

    def test_trees_per_hectare(self):
        self.assertAlmostEqual(trees_per_hectare(5.0, 5.0), 400.0)

    def test_dominant_height_identity_at_10_years(self):
        si = 22.0
        hd = dominant_height_from_site_index(si, 10.0)
        self.assertAlmostEqual(hd, si, places=6)
        si_back = site_index_from_dominant_height(hd, 10.0)
        self.assertAlmostEqual(si_back, si, places=6)


class PlotMetricsAPITests(APITestCase):
    def test_plot_metrics_endpoint_calculates_expected_values(self):
        url = reverse('plot-metrics')
        payload = {
            "trees": [{"dap_cm": 30.0, "height_m": 20.0}],
            "distance_in_row_m": 5.0,
            "distance_between_rows_m": 5.0,
            "plot_area_m2": 0,
            "age_years": 10,
            "species_root_ratio": 0.263,
            "min_trees_for_plot": 20,
            "animal_emission_kg_day": 5.0,
        }

        resp = self.client.post(url, data=payload, format='json')
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        agg = data['aggregates']

        # Valores esperados (según fórmulas) y redondeos del endpoint
        tph = trees_per_hectare(5.0, 5.0)  # 400
        ba_tree = basal_area_m2(30.0)
        vt_cc = volume_total_cc_m3(30.0, 20.0)
        vt_sc = volume_total_sc_m3(30.0, 20.0)
        vm_cc = volume_merchantable15_cc_m3(30.0, 20.0)
        vm_sc = volume_merchantable15_sc_m3(30.0, 20.0)
        b_above = biomass_above_kg(30.0, 20.0)
        b_root = biomass_root_kg(b_above, 0.263)

        self.assertEqual(round(ba_tree * tph, 2), agg['ab_per_ha_m2'])
        self.assertEqual(round(vt_cc * tph, 2), agg['vol_total_cc_per_ha_m3'])
        self.assertEqual(round(vt_sc * tph, 2), agg['vol_total_sc_per_ha_m3'])
        self.assertEqual(round(vm_cc * tph, 2), agg['vol_merchantable15_cc_per_ha_m3'])
        self.assertEqual(round(vm_sc * tph, 2), agg['vol_merchantable15_sc_per_ha_m3'])
        self.assertEqual(round((b_above) * tph / 1000.0, 2), agg['biomass_above_tn_per_ha'])
        self.assertEqual(round((b_root) * tph / 1000.0, 2), agg['biomass_root_tn_per_ha'])
        self.assertEqual(round(((b_above + b_root) * tph) / 1000.0, 2), agg['biomass_total_tn_per_ha'])
