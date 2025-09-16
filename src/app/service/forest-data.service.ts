import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as XLSX from 'xlsx';

export interface ForestSpecies {
  id: string;
  nombre: string;
  nombreCientifico: string;
  densidadMadera: number; // kg/m³
  factorForma: number; // Factor de forma para volumen
  factorBiomasa: number; // Factor de conversión biomasa
  coeficienteA?: number; // Coeficientes para ecuaciones alométricas
  coeficienteB?: number;
  coeficienteC?: number;
  alturaMaxima: number; // m
  dapMaximo: number; // cm
  descripcion?: string;
}

export interface TreeData {
  especie: string;
  dap: number | null;
  altura: number | null;
  edad?: number | null;
  sitio: string;
  ubicacion: string;
  fecha: string;
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForestDataService {
  private speciesSubject = new BehaviorSubject<ForestSpecies[]>(this.getDefaultSpecies());
  private treeDataSubject = new BehaviorSubject<TreeData[]>([]);

  species$ = this.speciesSubject.asObservable();
  treeData$ = this.treeDataSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Especies por defecto
  private getDefaultSpecies(): ForestSpecies[] {
    return [
      {
        id: 'pino-radiata',
        nombre: 'Pino Radiata',
        nombreCientifico: 'Pinus radiata',
        densidadMadera: 450,
        factorForma: 0.45,
        factorBiomasa: 1.3,
        coeficienteA: 0.0001,
        coeficienteB: 2.0,
        coeficienteC: 1.0,
        alturaMaxima: 40,
        dapMaximo: 80,
        descripcion: 'Conífera de crecimiento rápido, muy utilizada en plantaciones comerciales'
      },
      {
        id: 'eucalipto',
        nombre: 'Eucalipto',
        nombreCientifico: 'Eucalyptus globulus',
        densidadMadera: 650,
        factorForma: 0.5,
        factorBiomasa: 1.4,
        coeficienteA: 0.00012,
        coeficienteB: 1.8,
        coeficienteC: 1.1,
        alturaMaxima: 35,
        dapMaximo: 70,
        descripcion: 'Latifoliada de crecimiento rápido, buena para pulpa y madera'
      },
      {
        id: 'lenga',
        nombre: 'Lenga',
        nombreCientifico: 'Nothofagus pumilio',
        densidadMadera: 550,
        factorForma: 0.42,
        factorBiomasa: 1.2,
        coeficienteA: 0.00008,
        coeficienteB: 2.2,
        coeficienteC: 0.9,
        alturaMaxima: 30,
        dapMaximo: 60,
        descripcion: 'Especie nativa patagónica, madera de alta calidad'
      }
    ];
  }

  // Cargar datos desde localStorage
  private loadFromLocalStorage(): void {
    const savedSpecies = localStorage.getItem('forest-species');
    const savedTreeData = localStorage.getItem('tree-data');

    if (savedSpecies) {
      try {
        const species = JSON.parse(savedSpecies);
        this.speciesSubject.next(species);
      } catch (error) {
        console.error('Error loading species from localStorage:', error);
      }
    }

    if (savedTreeData) {
      try {
        const treeData = JSON.parse(savedTreeData);
        this.treeDataSubject.next(treeData);
      } catch (error) {
        console.error('Error loading tree data from localStorage:', error);
      }
    }
  }

  // Guardar en localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('forest-species', JSON.stringify(this.speciesSubject.value));
    localStorage.setItem('tree-data', JSON.stringify(this.treeDataSubject.value));
  }

  // Obtener especies
  getSpecies(): ForestSpecies[] {
    return this.speciesSubject.value;
  }

  // Obtener especie por ID
  getSpeciesById(id: string): ForestSpecies | undefined {
    return this.speciesSubject.value.find(species => species.id === id);
  }

  // Agregar nueva especie
  addSpecies(species: ForestSpecies): void {
    const currentSpecies = this.speciesSubject.value;
    const updatedSpecies = [...currentSpecies, species];
    this.speciesSubject.next(updatedSpecies);
    this.saveToLocalStorage();
  }

  // Actualizar especie
  updateSpecies(species: ForestSpecies): void {
    const currentSpecies = this.speciesSubject.value;
    const index = currentSpecies.findIndex(s => s.id === species.id);
    if (index !== -1) {
      currentSpecies[index] = species;
      this.speciesSubject.next([...currentSpecies]);
      this.saveToLocalStorage();
    }
  }

  // Eliminar especie
  deleteSpecies(id: string): void {
    const currentSpecies = this.speciesSubject.value;
    const filteredSpecies = currentSpecies.filter(s => s.id !== id);
    this.speciesSubject.next(filteredSpecies);
    this.saveToLocalStorage();
  }

  // Procesar archivo Excel
  async processExcelFile(file: File): Promise<{ species: ForestSpecies[], treeData: TreeData[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const result = {
            species: [] as ForestSpecies[],
            treeData: [] as TreeData[]
          };

          // Procesar hoja de especies si existe
          if (workbook.SheetNames.includes('Especies')) {
            const speciesSheet = workbook.Sheets['Especies'];
            const speciesData = XLSX.utils.sheet_to_json(speciesSheet);
            
            result.species = speciesData.map((row: any) => ({
              id: this.generateId(row.nombre || row.Nombre || ''),
              nombre: row.nombre || row.Nombre || '',
              nombreCientifico: row.nombreCientifico || row['Nombre Científico'] || '',
              densidadMadera: Number(row.densidadMadera || row['Densidad Madera'] || 500),
              factorForma: Number(row.factorForma || row['Factor Forma'] || 0.45),
              factorBiomasa: Number(row.factorBiomasa || row['Factor Biomasa'] || 1.3),
              coeficienteA: Number(row.coeficienteA || row['Coeficiente A'] || 0.0001),
              coeficienteB: Number(row.coeficienteB || row['Coeficiente B'] || 2.0),
              coeficienteC: Number(row.coeficienteC || row['Coeficiente C'] || 1.0),
              alturaMaxima: Number(row.alturaMaxima || row['Altura Máxima'] || 30),
              dapMaximo: Number(row.dapMaximo || row['DAP Máximo'] || 60),
              descripcion: row.descripcion || row.Descripción || ''
            }));
          }

          // Procesar hoja de datos de árboles
          const dataSheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes('datos') || 
            name.toLowerCase().includes('arboles') || 
            name.toLowerCase().includes('trees') ||
            name === workbook.SheetNames[0]
          ) || workbook.SheetNames[0];

          if (dataSheetName) {
            const dataSheet = workbook.Sheets[dataSheetName];
            const treeDataRaw = XLSX.utils.sheet_to_json(dataSheet);
            
            result.treeData = treeDataRaw.map((row: any) => ({
              especie: row.especie || row.Especie || row.species || '',
              dap: Number(row.dap || row.DAP || row.diametro || 0),
              altura: Number(row.altura || row.Altura || row.height || 0),
              edad: row.edad || row.Edad || row.age || undefined,
              sitio: row.sitio || row.Sitio || row.site || undefined,
              ubicacion: row.ubicacion || row.Ubicación || row.location || undefined,
              fecha: row.fecha || row.Fecha || row.date || undefined,
              observaciones: row.observaciones || row.Observaciones || row.notes || undefined
            }));
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Importar datos desde Excel
  async importFromExcel(file: File): Promise<void> {
    try {
      const { species, treeData } = await this.processExcelFile(file);
      
      // Agregar especies nuevas
      const currentSpecies = this.speciesSubject.value;
      const newSpecies = species.filter(newSpec => 
        !currentSpecies.some(existing => existing.id === newSpec.id)
      );
      
      if (newSpecies.length > 0) {
        this.speciesSubject.next([...currentSpecies, ...newSpecies]);
      }

      // Agregar datos de árboles
      const currentTreeData = this.treeDataSubject.value;
      this.treeDataSubject.next([...currentTreeData, ...treeData]);
      
      this.saveToLocalStorage();
    } catch (error) {
      throw new Error(`Error importing Excel file: ${error}`);
    }
  }

  // Generar ID único
  private generateId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'species-' + Date.now();
  }

  // Obtener datos de árboles
  getTreeData(): TreeData[] {
    return this.treeDataSubject.value;
  }

  // Limpiar todos los datos
  clearAllData(): void {
    this.speciesSubject.next(this.getDefaultSpecies());
    this.treeDataSubject.next([]);
    localStorage.removeItem('forest-species');
    localStorage.removeItem('tree-data');
  }

  // Exportar datos a Excel
  exportToExcel(): void {
    const wb = XLSX.utils.book_new();
    
    // Hoja de especies
    const speciesWs = XLSX.utils.json_to_sheet(this.speciesSubject.value);
    XLSX.utils.book_append_sheet(wb, speciesWs, 'Especies');
    
    // Hoja de datos de árboles
    const treeDataWs = XLSX.utils.json_to_sheet(this.treeDataSubject.value);
    XLSX.utils.book_append_sheet(wb, treeDataWs, 'Datos Árboles');
    
    // Descargar archivo
    XLSX.writeFile(wb, `datos-forestales-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Borrar todos los datos de árboles
  clearAllTreeData(): void {
    this.treeDataSubject.next([]);
  }

  // Agregar un nuevo árbol
  addTreeData(treeData: TreeData): void {
    const currentData = this.treeDataSubject.value;
    const newData = [...currentData, treeData];
    this.treeDataSubject.next(newData);
  }
}