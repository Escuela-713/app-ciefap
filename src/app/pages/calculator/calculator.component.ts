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

  showResults = false;
  showTreeTable = false;

  // resultados de la parcela
  results: any = null;

  // lista de árboles del usuario
  treeList: { dap: number; altura: number }[] = [];

  constructor(private fb: FormBuilder) {
    this.parcelForm = this.fb.group({
      especie: ['', Validators.required],
      productor: ['', Validators.required],
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

  get especie() { return this.parcelForm.get('especie'); }
  get productor() { return this.parcelForm.get('productor'); }
  get distanciaFila() { return this.parcelForm.get('distanciaFila'); }
  get distanciaEntreFilas() { return this.parcelForm.get('distanciaEntreFilas'); }
  get cantidadArboles() { return this.parcelForm.get('cantidadArboles'); }
  get edad() { return this.parcelForm.get('edad'); }

  get dap() { return this.treeForm.get('dap'); }
  get altura() { return this.treeForm.get('altura'); }

  // calcular parcela de ejemplo. falta la API
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

      this.showResults = true;
      this.showTreeTable = false;
      this.treeList = [];
    } else {
      this.parcelForm.markAllAsTouched();
    }
  }

  // agregamos arboles de forma individual
  addTree(): void {
    if (this.treeForm.valid) {
      this.treeList.push({ ...this.treeForm.value });
      this.treeForm.reset();
      this.showTreeTable = true;
    } else {
      this.treeForm.markAllAsTouched();
    }
  }

}