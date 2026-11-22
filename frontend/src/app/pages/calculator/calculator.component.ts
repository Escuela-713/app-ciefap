import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CalculatorService } from '../../service/calculator.service';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class CalculatorComponent {
  parcelForm: FormGroup;
  treeForm: FormGroup;
  results: any = null;
  treeList: { dap: number; altura: number }[] = [];

  // Control de límites, carga y popups
  maxArbolesPermitidos: number = 0;
  showSuccessModal: boolean = false;
  isSubmitting: boolean = false;

  // pestaña activa
  activeTab: 'parcela' | 'arboles' | 'resultados' = 'parcela';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private calculatorService: CalculatorService,
  ) {
    this.parcelForm = this.fb.group({
      especie: ['alamo'], // valor fijo
      distanciaFila: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      distanciaEntreFilas: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      cantidadArboles: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    });

    this.treeForm = this.fb.group({
      dap: ['', [Validators.required, Validators.min(10), Validators.max(1000)]],
      altura: ['', [Validators.required, Validators.min(1), Validators.max(200)]],
    });
  }

  // getters
  get distanciaFila() {
    return this.parcelForm.get('distanciaFila');
  }
  get distanciaEntreFilas() {
    return this.parcelForm.get('distanciaEntreFilas');
  }
  get cantidadArboles() {
    return this.parcelForm.get('cantidadArboles');
  }
  get edad() {
    return this.parcelForm.get('edad');
  }
  get dap() {
    return this.treeForm.get('dap');
  }
  get altura() {
    return this.treeForm.get('altura');
  }

  calculateParcel(): void {
    if (this.parcelForm.valid) {
      const { cantidadArboles } = this.parcelForm.value;

      this.maxArbolesPermitidos = Number(cantidadArboles);
      this.results = {};
      this.treeList = [];
      this.activeTab = 'arboles';
    } else {
      this.parcelForm.markAllAsTouched();
    }
  }

  addTree(): void {
    if (this.treeForm.valid) {
      if (this.treeList.length >= this.maxArbolesPermitidos) {
        alert(
          `Ya has alcanzado el límite de ${this.maxArbolesPermitidos} árboles indicados en la fase 1.`,
        );
        return;
      }

      this.treeList.push({
        dap: Number(this.treeForm.value.dap),
        altura: Number(this.treeForm.value.altura),
      });
      this.treeForm.reset();
    } else {
      this.treeForm.markAllAsTouched();
    }
  }

  // Calcular en el back, guardar en BD y avanzar a resultados (Fase 3)
  saveAndShowResults(): void {
    if (this.isSubmitting) return;

    if (this.treeList.length !== this.maxArbolesPermitidos) {
      alert(
        `Debes cargar exactamente ${this.maxArbolesPermitidos} árboles. Actualmente tienes ${this.treeList.length}.`,
      );
      return;
    }

    this.isSubmitting = true;

    const { especie, distanciaFila, distanciaEntreFilas, cantidadArboles, edad } =
      this.parcelForm.value;
    const distFilaNum = Number(distanciaFila);
    const distEntreFilasNum = Number(distanciaEntreFilas);
    const cantArbolesNum = Number(cantidadArboles);
    const edadNum = Number(edad);

    const calcPayload = {
      trees: this.treeList.map((t) => ({
        dap_cm: t.dap,
        height_m: t.altura,
      })),
      distance_in_row_m: distFilaNum,
      distance_between_rows_m: distEntreFilasNum,
      min_trees_for_plot: cantArbolesNum,
      age_years: edadNum,
    };

    this.calculatorService.calculateMetrics(calcPayload).subscribe({
      next: (metricsRes) => {
        const recordPayload = {
          input_data: {
            especie,
            distanciaFila: distFilaNum,
            distanciaEntreFilas: distEntreFilasNum,
            cantidadArboles: cantArbolesNum,
            edad: edadNum,
            trees: this.treeList,
          },
          metrics: metricsRes,
        };

        this.calculatorService.saveMeasurement(recordPayload).subscribe({
          next: () => {
            const tamanoParcela =
              metricsRes?.plot?.provided_area_m2 ??
              metricsRes?.plot?.recommended_area_m2_for_min_trees ??
              distFilaNum * distEntreFilasNum * cantArbolesNum;

            const radioParcela =
              metricsRes?.plot?.radius_from_provided_area_m ??
              metricsRes?.plot?.recommended_radius_m ??
              0;

            const alturaDominante =
              metricsRes?.site?.dominant_height_from_site_index_m ??
              metricsRes?.aggregates?.height_mean_m ??
              0;

            const indiceSitio = metricsRes?.site?.site_index_from_dominant_height_m ?? '-';

            this.results = {
              tamano: Number(tamanoParcela).toFixed(2),
              radio: Number(radioParcela).toFixed(2),
              alturaDominante: Number(alturaDominante).toFixed(2),
              indiceSitio: indiceSitio === '-' ? '-' : Number(indiceSitio).toFixed(2),
            };

            this.isSubmitting = false;
            this.activeTab = 'resultados';
            this.showSuccessModal = true;
          },
          error: (err) => {
            console.error('Error al guardar en la base de datos:', err);
            this.isSubmitting = false;
            alert('Se calcularon los datos, pero hubo un error al guardar en el historial.');
          },
        });
      },
      error: (err) => {
        console.error('Error al calcular en el backend:', err);
        this.isSubmitting = false;
        alert('No se pudo conectar con el backend para calcular.');
      },
    });
  }

  closeModal(): void {
    this.showSuccessModal = false;
  }

  goToHistory(): void {
    this.router.navigate(['/historial']);
  }
}
