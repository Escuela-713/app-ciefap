import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TreeInput {
  dap_cm: number;
  height_m: number;
}

export interface PlotMetricsPayload {
  trees: TreeInput[];
  distance_in_row_m: number;
  distance_between_rows_m: number;
  plot_area_m2?: number;
  min_trees_for_plot?: number;
  age_years: number;
  animal_emission_kg_day?: number;
  site_index_m?: number | null;
  dominant_height_m?: number | null;
  species_root_ratio?: number;
}

export interface MeasurementPayload {
  plot_id?: number | null;
  input_data: Record<string, any>;
  metrics?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  // Ajustar este path si el include() en el urls.py principal tiene otro prefijo, no me acuerdo xd
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  calculateMetrics(payload: PlotMetricsPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/calc/metrics`, payload);
  }

  createMeasurement(payload: MeasurementPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/records`, payload);
  }

  getMeasurements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/records`);
  }
}
