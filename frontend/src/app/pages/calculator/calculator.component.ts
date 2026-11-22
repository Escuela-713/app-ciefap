import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  // Control de límites y popups
  maxArbolesPermitidos: number = 0;
  showSuccessModal: boolean = false;

  // pestaña activa
  activeTab: 'parcela' | 'arboles' | 'resultados' = 'parcela';

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
      const { distanciaFila, distanciaEntreFilas, cantidadArboles, edad } = this.parcelForm.value;

      this.maxArbolesPermitidos = cantidadArboles;
      const tamanoParcela = distanciaFila * distanciaEntreFilas * cantidadArboles;
      const radioParcela = Math.sqrt(tamanoParcela / Math.PI);
      const alturaDominante = edad * 0.5;
      const indiceSitio = alturaDominante / edad;

      this.results = {
        tamano: tamanoParcela.toFixed(2),
        radio: radioParcela.toFixed(2),
        alturaDominante: alturaDominante.toFixed(2),
        indiceSitio: indiceSitio.toFixed(2),
      };

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

      this.treeList.push({ ...this.treeForm.value });
      this.treeForm.reset();
    } else {
      this.treeForm.markAllAsTouched();
    }
  }

  // Guardar y avanzar a resultados (Fase 3)
  saveAndShowResults(): void {
    if (this.treeList.length !== this.maxArbolesPermitidos) {
      alert(
        `Debes cargar exactamente ${this.maxArbolesPermitidos} árboles. Actualmente tienes ${this.treeList.length}.`,
      );
      return;
    }

    // Guardado automático en localStorage (simulando BD)
    const record = {
      fecha: new Date().toLocaleString(),
      parcela: this.results,
      arboles: this.treeList,
    };

    const existing = localStorage.getItem('historial');
    const historial = existing ? JSON.parse(existing) : [];
    historial.push(record);
    localStorage.setItem('historial', JSON.stringify(historial));

    // Cambiar a pestaña resultados y mostrar el popup
    this.activeTab = 'resultados';
    this.showSuccessModal = true;
  }

  closeModal(): void {
    this.showSuccessModal = false;
  }

  goToHistory(): void {
    this.router.navigate(['/historial']);
  }
}
