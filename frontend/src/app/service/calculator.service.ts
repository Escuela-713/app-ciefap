import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackendTree {
  dap_cm: number;
  height_m: number;
}

export interface CalculateMetricsRequest {
  trees: BackendTree[];
  distance_in_row_m: number;
  distance_between_rows_m: number;
  plot_area_m2?: number;
  min_trees_for_plot?: number;
  age_years: number;
  dominant_height_m?: number | null;
  site_index_m?: number | null;
}

export interface SaveRecordRequest {
  plot_id?: number | null;
  input_data: Record<string, any>;
  metrics?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) {}

  calculateMetrics(payload: CalculateMetricsRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/calc/metrics`, payload);
  }

  saveMeasurement(payload: SaveRecordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/records`, payload);
  }

  getMeasurements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/records`);
  }
}
