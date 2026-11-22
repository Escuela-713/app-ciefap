import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CalculatorService } from '../../service/calculator.service';

export interface MeasurementRecord {
  id: number;
  plot: number | null;
  input_data: {
    especie?: string;
    distanciaFila?: number;
    distanciaEntreFilas?: number;
    cantidadArboles?: number;
    edad?: number;
    trees?: { dap?: number; altura?: number; dap_cm?: number; height_m?: number }[];
  };
  metrics: {
    per_tree?: any[];
    aggregates?: {
      trees_count?: number;
      dap_mean_cm?: number | null;
      height_mean_m?: number | null;
      ab_per_ha_m2?: number | null;
      vol_total_cc_per_ha_m3?: number | null;
      vol_total_sc_per_ha_m3?: number | null;
      vol_merchantable15_cc_per_ha_m3?: number | null;
      vol_merchantable15_sc_per_ha_m3?: number | null;
      biomass_above_tn_per_ha?: number | null;
      biomass_root_tn_per_ha?: number | null;
      biomass_total_tn_per_ha?: number | null;
      trees_per_ha?: number | null;
      trees_per_ha_by_spacing?: number | null;
    };
    site?: {
      dominant_height_from_site_index_m?: number | null;
      site_index_from_dominant_height_m?: number | null;
      age_years?: number | null;
    };
    plot?: {
      recommended_area_m2_for_min_trees?: number | null;
      recommended_radius_m?: number | null;
      provided_area_m2?: number | null;
      radius_from_provided_area_m?: number | null;
      min_trees_for_plot?: number | null;
    };
    carbon?: {
      c_bosque_tn_per_ha?: number | null;
      capture_kg_per_day_per_ha?: number | null;
      animal_emission_kg_day?: number | null;
      animals_per_ha_equilibrium?: number | null;
      c_suelo_tn_per_ha?: number | null;
      c_raices_pastura_tn_per_ha?: number | null;
    };
  };
  created_at: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class HistorialComponent implements OnInit {
  records: MeasurementRecord[] = [];
  selectedRecord: MeasurementRecord | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private calculatorService: CalculatorService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.calculatorService.getMeasurements().subscribe({
      next: (data) => {
        // Ordenar del más reciente al más antiguo
        this.records = [...(data || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        if (this.records.length > 0) {
          this.selectedRecord = this.records[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.errorMessage = 'No se pudo cargar el historial desde el servidor.';
        this.isLoading = false;
      },
    });
  }

  selectRecord(record: MeasurementRecord): void {
    this.selectedRecord = record;
  }

  formatNum(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '—';
    }
    return Number(value).toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  getDias(rec: MeasurementRecord): string {
    const edad = rec.metrics?.site?.age_years ?? rec.input_data?.edad;
    if (edad === null || edad === undefined || Number.isNaN(Number(edad))) {
      return '—';
    }
    return String(Math.round(Number(edad) * 365));
  }

  getTamanoParcela(rec: MeasurementRecord): string {
    const val =
      rec.metrics?.plot?.provided_area_m2 ?? rec.metrics?.plot?.recommended_area_m2_for_min_trees;
    return this.formatNum(val, 2);
  }

  getRadioParcela(rec: MeasurementRecord): string {
    const val =
      rec.metrics?.plot?.radius_from_provided_area_m ?? rec.metrics?.plot?.recommended_radius_m;
    return this.formatNum(val, 2);
  }

  getAlturaDominante(rec: MeasurementRecord): string {
    const val =
      rec.metrics?.site?.dominant_height_from_site_index_m ??
      rec.metrics?.aggregates?.height_mean_m;
    return this.formatNum(val, 2);
  }

  getIndiceSitio(rec: MeasurementRecord): string {
    const isVal = rec.metrics?.site?.site_index_from_dominant_height_m;
    if (isVal !== null && isVal !== undefined) {
      return this.formatNum(isVal, 2);
    }
    const altDom =
      rec.metrics?.site?.dominant_height_from_site_index_m ??
      rec.metrics?.aggregates?.height_mean_m;
    const edad = rec.metrics?.site?.age_years ?? rec.input_data?.edad;
    if (altDom && edad && Number(edad) > 0) {
      return this.formatNum(Number(altDom) / Number(edad), 2);
    }
    return '—';
  }

  getArbolesPorHa(rec: MeasurementRecord): string {
    const val =
      rec.metrics?.aggregates?.trees_per_ha ?? rec.metrics?.aggregates?.trees_per_ha_by_spacing;
    return this.formatNum(val, 0);
  }
}
export { HistorialComponent as Historial };
