import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { ForestDataService, ForestSpecies } from '../../service/forest-data.service';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, DecimalPipe, CommonModule],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class CalculatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private forestDataService = inject(ForestDataService);

  // Datos de especies disponibles
  species: ForestSpecies[] = [];
  selectedSpecies?: ForestSpecies;

  // Formulario con validación - campos que el usuario ingresa (en azul)
  form = this.fb.group({
    speciesId: [null, [Validators.required]],                             // Especie seleccionada - Campo azul
    dap: [null, [Validators.required, Validators.min(0.1)]],               // cm - Campo azul
    height: [null, [Validators.required, Validators.min(0.1)]],            // m - Campo azul
    siteClass: [null, [Validators.required, Validators.min(1), Validators.max(3)]], // Clase de sitio I, II, III - Campo azul
    treeCount: [null, [Validators.required, Validators.min(1)]]            // Cantidad de árboles
  });

  ngOnInit(): void {
    // Cargar especies disponibles
    this.forestDataService.species$.subscribe(species => {
      this.species = species;
    });

    // Escuchar cambios en la selección de especie
    this.form.get('speciesId')?.valueChanges.subscribe(speciesId => {
      if (speciesId) {
        this.selectedSpecies = this.species.find(s => s.id === speciesId);
      }
    });
  }

  result?: {
    // Datos calculados
    basalAreaPerTree: number;      // Área basal por árbol (m²)
    totalBasalArea: number;        // Área basal total (m²)
    volumePerTree: number;         // Volumen por árbol (m³)
    totalVolume: number;           // Volumen total (m³)
    biomassPerTree: number;        // Biomasa por árbol (kg)
    totalBiomass: number;          // Biomasa total (kg)
    // Para el gráfico
    ageVolumeData: { age: number; volume: number }[];
  };

  calculate(): void {
    // Validar el formulario y marcar todos los campos como tocados para mostrar errores
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const { speciesId, dap, height, siteClass, treeCount } = this.form.value;

    // Obtener datos de la especie seleccionada
    if (!speciesId) {
      console.error('Especie no seleccionada');
      return;
    }
    
    const species = this.species.find(s => s.id === speciesId);
    if (!species) {
      console.error('Especie no encontrada');
      return;
    }

    // Cálculos forestales usando parámetros específicos de la especie
    const dapM = (dap ?? 0) / 100; // Convertir cm a m
    const heightM = height ?? 0;
    const trees = treeCount ?? 1;
    const site = siteClass ?? 2;

    // 1. Área basal por árbol (m²)
    const basalAreaPerTree = Math.PI * Math.pow(dapM / 2, 2);
    const totalBasalArea = basalAreaPerTree * trees;

    // 2. Volumen por árbol usando ecuación alométrica y factor de forma específico
    const siteNumber = Number(site);
    const siteFactor = siteNumber === 1 ? 1.2 : siteNumber === 2 ? 1.0 : 0.8;
    const volumePerTree = basalAreaPerTree * heightM * species.factorForma * siteFactor;
    const totalVolume = volumePerTree * trees;

    // 3. Biomasa usando densidad específica de la especie
    // Biomasa = Volumen * Densidad_madera * Factor_biomasa
    const woodDensity = species.densidadMadera / 1000; // kg/m³ a kg/dm³
    const biomassPerTree = volumePerTree * 1000 * woodDensity * species.factorBiomasa; // m³ a dm³
    const totalBiomass = biomassPerTree * trees;

    // 4. Datos para el gráfico (simulación de crecimiento)
    const ageVolumeData = this.generateGrowthCurve(dap ?? 0, heightM, siteNumber);

    this.result = {
      basalAreaPerTree,
      totalBasalArea,
      volumePerTree,
      totalVolume,
      biomassPerTree,
      totalBiomass,
      ageVolumeData
    };
  }

  private generateGrowthCurve(currentDap: number, currentHeight: number, siteClass: number): { age: number; volume: number }[] {
    const data = [];
    const siteFactor = siteClass === 1 ? 1.2 : siteClass === 2 ? 1.0 : 0.8;
    
    // Estimar edad actual basada en DAP (aproximación)
    const estimatedAge = Math.max(1, Math.round(currentDap / 2.5));
    
    for (let age = 1; age <= 20; age++) {
      // Proyección simplificada de crecimiento
      const projectedDap = age * 2.5 * siteFactor;
      const projectedHeight = Math.min(30, age * 1.5 * siteFactor);
      const volume = 0.0001 * Math.pow(projectedDap, 2) * projectedHeight * siteFactor;
      
      data.push({ age, volume });
    }
    
    return data;
  }

  getChartPoints(data: {age: number, volume: number}[]): string {
    if (!data || data.length === 0) return '';
    
    const maxVolume = Math.max(...data.map(d => d.volume));
    const points = data.map((point, index) => {
      const x = 50 + (index * 15); // Espaciado horizontal
      const y = 200 - ((point.volume / maxVolume) * 150); // Escala vertical
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }
}