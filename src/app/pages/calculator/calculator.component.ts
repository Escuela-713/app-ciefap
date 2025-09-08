import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, DecimalPipe],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class CalculatorComponent {
  private fb = inject(FormBuilder);

  // Formulario con validación
  form = this.fb.group({
    dap: [null, [Validators.required, Validators.min(0)]],                 // cm
    height: [null, [Validators.required, Validators.min(0)]],              // m
    spacingRow: [null, [Validators.required, Validators.min(0.01)]],       // m
    spacingBetweenRows: [null, [Validators.required, Validators.min(0.01)]],// m
    age: [null, [Validators.required, Validators.min(0)]]                  // años
  });

  result?: { treesPerHa: number; basalArea: number };

  calculate(): void {
    // Validar el formulario y marcar todos los campos como tocados para mostrar errores
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const { dap, spacingRow, spacingBetweenRows } = this.form.value;

    // Cálculos forestales:
    // - basalArea: m² por árbol (DAP está en cm -> convertir a m)
    // - treesPerHa: densidad de árboles por hectárea
    const dapM = (dap ?? 0) / 100;
    const basalArea = Math.PI * Math.pow(dapM / 2, 2);
    const densityPerM2 = 1 / ((spacingRow ?? 1) * (spacingBetweenRows ?? 1));
    const treesPerHa = densityPerM2 * 10_000;

    this.result = { treesPerHa, basalArea };
  }
}