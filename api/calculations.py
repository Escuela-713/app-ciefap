import math
from typing import List, Dict, Optional


def basal_area_m2(dap_cm: float) -> float:
    dap_m = dap_cm / 100.0
    return (math.pi * (dap_m ** 2)) / 4.0


def volume_total_cc_m3(dap_cm: float, height_m: float) -> float:
    return 0.0006 + 0.3348 * ((dap_cm / 100.0) ** 2) * height_m


def volume_total_sc_m3(dap_cm: float, height_m: float) -> float:
    return -0.0021 + 0.3127 * ((dap_cm / 100.0) ** 2) * height_m


def volume_merchantable15_cc_m3(dap_cm: float, height_m: float) -> float:
    return -0.0136 + 0.3247 * ((dap_cm / 100.0) ** 2) * height_m


def volume_merchantable15_sc_m3(dap_cm: float, height_m: float) -> float:
    # Fórmula no especificada explícitamente; aproximamos usando la relación s/c vs c/c.
    vt_cc = volume_total_cc_m3(dap_cm, height_m)
    vt_sc = volume_total_sc_m3(dap_cm, height_m)
    ratio = vt_sc / vt_cc if vt_cc > 0 else 0.93
    return volume_merchantable15_cc_m3(dap_cm, height_m) * ratio


# Biomasa
def biomass_above_kg(dap_cm: float, height_m: float) -> float:
    # Fórmula provista: -0.0808 + 0.0206 * DAP^2.337 * H^0.614
    return -0.0808 + 0.0206 * (dap_cm ** 2.337) * (height_m ** 0.614)


def biomass_root_kg(biomass_above_kg_value: float, root_ratio: float = 0.263) -> float:
    # Relación raíz/aérea aproximada según planilla (~0.263)
    return biomass_above_kg_value * root_ratio


def trees_per_hectare(dist_in_row_m: float, dist_between_rows_m: float) -> float:
    if dist_in_row_m <= 0 or dist_between_rows_m <= 0:
        return 0.0
    return 10000.0 / (dist_in_row_m * dist_between_rows_m)


def aggregate_plot_metrics(
    trees: List[Dict[str, float]],
    dist_in_row_m: float,
    dist_between_rows_m: float,
    plot_area_m2: float = 0.0,
    age_years: Optional[float] = None,
    animal_emission_kg_day: float = 5.0,
    root_ratio: float = 0.263,
) -> Dict[str, float]:
    n = len(trees)
    if n == 0:
        return {
            "trees_count": 0,
            "dap_mean_cm": 0.0,
            "height_mean_m": 0.0,
            "dap2_mean": 0.0,
            "ab_per_tree_m2": 0.0,
            "ab_per_ha_m2": 0.0,
            "vol_total_cc_per_ha_m3": 0.0,
            "vol_total_sc_per_ha_m3": 0.0,
            "vol_merchantable15_cc_per_ha_m3": 0.0,
            "vol_merchantable15_sc_per_ha_m3": 0.0,
            "trees_per_ha": trees_per_hectare(dist_in_row_m, dist_between_rows_m),
        }

    dap_sum = 0.0
    height_sum = 0.0
    dap2_sum = 0.0
    ab_sum = 0.0
    vt_cc_sum = 0.0
    vt_sc_sum = 0.0
    vm15_cc_sum = 0.0
    vm15_sc_sum = 0.0
    ba_sum = 0.0
    biomass_above_sum_kg = 0.0
    biomass_root_sum_kg = 0.0

    for t in trees:
        dap = float(t.get("dap_cm", 0.0))
        h = float(t.get("height_m", 0.0))
        dap_sum += dap
        height_sum += h
        dap2_sum += (dap ** 2)
        ab = basal_area_m2(dap)
        ab_sum += ab
        ba_sum += ab
        vt_cc_sum += volume_total_cc_m3(dap, h)
        vt_sc_sum += volume_total_sc_m3(dap, h)
        vm15_cc_sum += volume_merchantable15_cc_m3(dap, h)
        vm15_sc_sum += volume_merchantable15_sc_m3(dap, h)
        b_above = biomass_above_kg(dap, h)
        biomass_above_sum_kg += b_above
        biomass_root_sum_kg += biomass_root_kg(b_above, root_ratio)

    dap_mean = dap_sum / n
    height_mean = height_sum / n
    dap2_mean = dap2_sum / n
    ab_per_tree = ab_sum / n
    vt_cc_per_tree = vt_cc_sum / n
    vt_sc_per_tree = vt_sc_sum / n
    vm15_cc_per_tree = vm15_cc_sum / n
    vm15_sc_per_tree = vm15_sc_sum / n

    # Árboles/ha; si hay área de parcela, usar conteo para estimar por hectárea
    tph_spacing = trees_per_hectare(dist_in_row_m, dist_between_rows_m)
    if plot_area_m2 and plot_area_m2 > 0:
        tph_plot = (n * 10000.0) / plot_area_m2
    else:
        tph_plot = 0.0
    tph = tph_plot if tph_plot > 0 else tph_spacing

    return {
        "trees_count": n,
        "dap_mean_cm": round(dap_mean, 2),
        "height_mean_m": round(height_mean, 2),
        "dap2_mean": round(dap2_mean, 2),
        "ab_per_tree_m2": round(ab_per_tree, 4),
        "ab_per_ha_m2": round(ab_per_tree * tph, 2),
        "vol_total_cc_per_ha_m3": round(vt_cc_per_tree * tph, 2),
        "vol_total_sc_per_ha_m3": round(vt_sc_per_tree * tph, 2),
        "vol_merchantable15_cc_per_ha_m3": round(vm15_cc_per_tree * tph, 2),
        "vol_merchantable15_sc_per_ha_m3": round(vm15_sc_per_tree * tph, 2),
        "biomass_above_tn_per_ha": round((biomass_above_sum_kg / n) * tph / 1000.0, 2),
        "biomass_root_tn_per_ha": round((biomass_root_sum_kg / n) * tph / 1000.0, 2),
        "biomass_total_tn_per_ha": round(((biomass_above_sum_kg + biomass_root_sum_kg) / n) * tph / 1000.0, 2),
        "trees_per_ha": round(tph),
        "trees_per_ha_by_spacing": round(tph_spacing),
        "trees_per_ha_by_plot": round(tph_plot) if tph_plot > 0 else None,
    }


# Curvas de sitio / altura dominante
def dominant_height_from_site_index(site_index_m: float, age_years: float) -> float:
    # Hd = (SI * (1 - e^(-0.14 * edad))^(1/0.67)) / (1 - e^(-0.14 * 10))^(1/0.67)
    numerator = site_index_m * ((1 - math.exp(-0.14 * age_years)) ** (1 / 0.67))
    denominator = ((1 - math.exp(-0.14 * 10)) ** (1 / 0.67))
    return numerator / denominator


def site_index_from_dominant_height(dominant_height_m: float, age_years: float) -> float:
    # SI = (Hd * (1 - e^(-0.14 * 10))^(1/0.67)) / (1 - e^(-0.14 * edad))^(1/0.67)
    numerator = dominant_height_m * ((1 - math.exp(-0.14 * 10)) ** (1 / 0.67))
    denominator = ((1 - math.exp(-0.14 * age_years)) ** (1 / 0.67))
    return numerator / denominator


def recommended_plot_area_m2(dist_in_row_m: float, dist_between_rows_m: float, min_trees: int = 20) -> float:
    # Área mínima para que entren 'min_trees' árboles: min_trees * dist_en_fila * dist_entre_filas
    return float(min_trees) * dist_in_row_m * dist_between_rows_m


def plot_radius_from_area_m(area_m2: float) -> float:
    return math.sqrt(area_m2 / math.pi)


def days_from_age(age_years: float) -> int:
    return int(round(age_years * 365))


def carbon_forest_tn_per_ha(biomass_total_tn_per_ha: float, fraction: float = 0.49) -> float:
    return biomass_total_tn_per_ha * fraction


def capture_kg_per_day_per_ha(carbon_forest_tn_per_ha_value: float, age_years: float) -> float:
    # (C_bosque tn/ha / (edad*365)) * 1000
    days = age_years * 365
    if days <= 0:
        return 0.0
    return (carbon_forest_tn_per_ha_value / days) * 1000.0


def animals_per_ha_equilibrium(capture_kg_per_day_per_ha_value: float, animal_emission_kg_day: float = 5.0) -> float:
    if animal_emission_kg_day <= 0:
        return 0.0
    return capture_kg_per_day_per_ha_value / animal_emission_kg_day