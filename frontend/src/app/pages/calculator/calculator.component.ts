import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class CalculatorComponent {
  parcelForm: FormGroup;
  treeForm: FormGroup;
  results: any = null;
  treeList: { dap: number; altura: number }[] = [];

  // pestaña activa
  activeTab: 'parcela' | 'arboles' | 'resultados' = 'parcela';

  constructor(private fb: FormBuilder) {
    this.parcelForm = this.fb.group({
      especie: ['alamo'], // valor fijo
      distanciaFila: ['', Validators.required],
      distanciaEntreFilas: ['', Validators.required],
      cantidadArboles: ['', Validators.required],
      edad: ['', Validators.required],
    });

    this.treeForm = this.fb.group({
      dap: ['', Validators.required],
      altura: ['', Validators.required],
    });
  }

  // getters
  get distanciaFila() { return this.parcelForm.get('distanciaFila'); }
  get distanciaEntreFilas() { return this.parcelForm.get('distanciaEntreFilas'); }
  get cantidadArboles() { return this.parcelForm.get('cantidadArboles'); }
  get edad() { return this.parcelForm.get('edad'); }

  get dap() { return this.treeForm.get('dap'); }
  get altura() { return this.treeForm.get('altura'); }

  calculateParcel(): void {
    if (this.parcelForm.valid) {
      const { distanciaFila, distanciaEntreFilas, cantidadArboles, edad } = this.parcelForm.value;

      const tamanoParcela = distanciaFila * distanciaEntreFilas * cantidadArboles;
      const radioParcela = Math.sqrt(tamanoParcela / Math.PI);
      const alturaDominante = edad * 0.5;
      const indiceSitio = alturaDominante / edad;

      this.results = {
        tamano: tamanoParcela.toFixed(2),
        radio: radioParcela.toFixed(2),
        alturaDominante: alturaDominante.toFixed(2),
        indiceSitio: indiceSitio.toFixed(2)
      };

      this.treeList = [];
      this.activeTab = 'arboles'; // pasa automáticamente a la siguiente pestaña
    } else {
      this.parcelForm.markAllAsTouched();
    }
  }

  addTree(): void {
    if (this.treeForm.valid) {
      this.treeList.push({ ...this.treeForm.value });
      this.treeForm.reset();
    } else {
      this.treeForm.markAllAsTouched();
    }
  }


  saveToHistory(): void {
  if (!this.results || !this.treeList.length) {
    alert('No hay resultados o árboles cargados para guardar.');
    return;
  }

  // Construye el objeto a guardar
  const record = {
    fecha: new Date().toLocaleString(),
    parcela: this.results,
    arboles: this.treeList
  };

  // aca obtiene el historial del localstorage
  const existing = localStorage.getItem('historial');
  const historial = existing ? JSON.parse(existing) : [];

  // agrega el nuevo registro
  historial.push(record);

  // Guarda nuevamente
  localStorage.setItem('historial', JSON.stringify(historial));

  alert('Registro guardado en el historial');
}

}
