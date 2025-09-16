import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForestDataService, ForestSpecies, TreeData } from '../../service/forest-data.service';

@Component({
  selector: 'app-forest-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forest-data.component.html',
  styleUrl: './forest-data.component.css'
})
export class ForestDataComponent implements OnInit {
  private forestDataService = inject(ForestDataService);
  
  species: ForestSpecies[] = [];
  treeData: TreeData[] = [];
  selectedTab: 'upload' | 'add-tree' | 'species' | 'data' = 'upload';
  isLoading = false;
  uploadMessage = '';
  uploadError = '';
  
  // Filtros
  speciesFilter = '';
  dataFilter = '';
  
  // Formulario para agregar árbol
  newTreeData: TreeData = {
    especie: '',
    dap: null,
    altura: null,
    edad: null,
    sitio: '',
    ubicacion: '',
    fecha: '',
    observaciones: ''
  };

  selectedSpeciesInfo: ForestSpecies | null = null;
  missingDataPrompts: string[] = [];
  
  ngOnInit(): void {
    this.forestDataService.species$.subscribe(species => {
      this.species = species;
    });
    
    this.forestDataService.treeData$.subscribe(data => {
      this.treeData = data;
    });
  }
  
  // Manejar carga de archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      this.uploadError = 'Por favor seleccione un archivo Excel válido (.xlsx o .xls)';
      return;
    }
    
    this.uploadFile(file);
  }
  
  // Subir archivo
  async uploadFile(file: File): Promise<void> {
    this.isLoading = true;
    this.uploadError = '';
    this.uploadMessage = '';
    
    try {
      await this.forestDataService.importFromExcel(file);
      this.uploadMessage = `Archivo "${file.name}" cargado exitosamente. Se han importado los datos de especies y árboles.`;
      
      // Cambiar a la pestaña de especies para mostrar los datos importados
      setTimeout(() => {
        this.selectedTab = 'species';
      }, 2000);
      
    } catch (error) {
      this.uploadError = `Error al cargar el archivo: ${error}`;
    } finally {
      this.isLoading = false;
    }
  }
  
  // Filtrar especies
  get filteredSpecies(): ForestSpecies[] {
    if (!this.speciesFilter) return this.species;
    
    const filter = this.speciesFilter.toLowerCase();
    return this.species.filter(species => 
      species.nombre.toLowerCase().includes(filter) ||
      species.nombreCientifico.toLowerCase().includes(filter)
    );
  }
  
  // Filtrar datos de árboles
  get filteredTreeData(): TreeData[] {
    if (!this.dataFilter) return this.treeData;
    
    const filter = this.dataFilter.toLowerCase();
    return this.treeData.filter(data => 
      data.especie.toLowerCase().includes(filter) ||
      (data.ubicacion && data.ubicacion.toLowerCase().includes(filter)) ||
      (data.sitio && data.sitio.toLowerCase().includes(filter))
    );
  }
  
  // Eliminar especie
  deleteSpecies(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta especie?')) {
      this.forestDataService.deleteSpecies(id);
    }
  }
  
  // Limpiar todos los datos
  clearAllData(): void {
    if (confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
      this.forestDataService.clearAllData();
      this.uploadMessage = 'Todos los datos han sido eliminados. Se han restaurado las especies por defecto.';
    }
  }
  
  // Exportar datos
  exportData(): void {
    this.forestDataService.exportToExcel();
    this.uploadMessage = 'Datos exportados exitosamente.';
  }
  
  // Descargar plantilla Excel
  downloadTemplate(): void {
    const templateData = {
      especies: [
        {
          nombre: 'Pino Ejemplo',
          'Nombre Científico': 'Pinus exemplum',
          'Densidad Madera': 450,
          'Factor Forma': 0.45,
          'Factor Biomasa': 1.3,
          'Coeficiente A': 0.0001,
          'Coeficiente B': 2.0,
          'Coeficiente C': 1.0,
          'Altura Máxima': 40,
          'DAP Máximo': 80,
          'Descripción': 'Ejemplo de especie forestal'
        }
      ],
      datos: [
        {
          especie: 'Pino Ejemplo',
          DAP: 25.5,
          altura: 18.2,
          edad: 12,
          sitio: 'Clase II',
          ubicacion: 'Parcela 1',
          fecha: '2024-01-15',
          observaciones: 'Árbol saludable'
        }
      ]
    };
    
    // Crear workbook
    const XLSX = (window as any).XLSX;
    const wb = XLSX.utils.book_new();
    
    // Agregar hojas
    const especiesWs = XLSX.utils.json_to_sheet(templateData.especies);
    const datosWs = XLSX.utils.json_to_sheet(templateData.datos);
    
    XLSX.utils.book_append_sheet(wb, especiesWs, 'Especies');
    XLSX.utils.book_append_sheet(wb, datosWs, 'Datos');
    
    // Descargar
    XLSX.writeFile(wb, 'plantilla-datos-forestales.xlsx');
  }
  
  // Obtener estadísticas
  get statistics() {
    const speciesCount = this.species.length;
    const treeDataCount = this.treeData.length;
    const uniqueSpeciesInData = new Set(this.treeData.map(d => d.especie)).size;
    
    return {
      speciesCount,
      treeDataCount,
      uniqueSpeciesInData
    };
  }

  // Borrar todos los datos de árboles
  clearAllTreeData(): void {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos de árboles? Esta acción no se puede deshacer.')) {
      this.forestDataService.clearAllTreeData();
      this.uploadMessage = 'Todos los datos de árboles han sido eliminados.';
      this.uploadError = '';
    }
  }

  // Manejar cambio de especie en el formulario
  onSpeciesChange(event: any): void {
    const speciesName = event.target.value;
    this.selectedSpeciesInfo = this.species.find(s => s.nombre === speciesName) || null;
    this.generateMissingDataPrompts();
    
    // Auto-completar fecha actual si no está establecida
    if (!this.newTreeData.fecha) {
      const today = new Date();
      this.newTreeData.fecha = today.toISOString().split('T')[0];
    }
  }

  // Generar prompts para datos faltantes
  generateMissingDataPrompts(): void {
    this.missingDataPrompts = [];
    
    if (!this.selectedSpeciesInfo) {
      return;
    }
    
    const prompts: string[] = [];
    
    // Verificar datos faltantes basados en parámetros de la especie
    if (this.selectedSpeciesInfo) {
      if (!this.newTreeData.dap || this.newTreeData.dap < 1 || this.newTreeData.dap > this.selectedSpeciesInfo.dapMaximo) {
        prompts.push(`DAP recomendado para ${this.selectedSpeciesInfo.nombre}: 1-${this.selectedSpeciesInfo.dapMaximo} cm`);
      }
      
      if (!this.newTreeData.altura || this.newTreeData.altura < 1 || this.newTreeData.altura > this.selectedSpeciesInfo.alturaMaxima) {
        prompts.push(`Altura recomendada para ${this.selectedSpeciesInfo.nombre}: 1-${this.selectedSpeciesInfo.alturaMaxima} m`);
      }
    }
    
    this.missingDataPrompts = prompts;
  }

  // Agregar nuevo árbol
  addTreeData(): void {
    if (!this.newTreeData.especie || !this.newTreeData.dap || !this.newTreeData.altura) {
      this.uploadError = 'Por favor complete todos los campos requeridos (Especie, DAP, Altura)';
      return;
    }
    
    // Crear una copia del objeto para agregar
    const treeToAdd: TreeData = {
      ...this.newTreeData,
      dap: Number(this.newTreeData.dap),
      altura: Number(this.newTreeData.altura),
      edad: this.newTreeData.edad ? Number(this.newTreeData.edad) : undefined
    };
    
    // Agregar al servicio
    this.forestDataService.addTreeData(treeToAdd);
    
    // Mostrar mensaje de éxito
    this.uploadMessage = `Árbol de ${this.newTreeData.especie} agregado exitosamente.`;
    this.uploadError = '';
    
    // Limpiar formulario
    this.resetForm();
    
    // Cambiar a la pestaña de datos después de 2 segundos
    setTimeout(() => {
      this.selectedTab = 'data';
    }, 2000);
  }

  // Limpiar formulario
  resetForm(): void {
    this.newTreeData = {
      especie: '',
      dap: null,
      altura: null,
      edad: null,
      sitio: '',
      ubicacion: '',
      fecha: '',
      observaciones: ''
    };
    this.selectedSpeciesInfo = null;
    this.missingDataPrompts = [];
  }
}