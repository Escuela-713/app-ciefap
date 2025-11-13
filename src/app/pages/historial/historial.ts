import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial {
  historial: any[] = [];

  ngOnInit(): void {
    const data = localStorage.getItem('historial');
    this.historial = data ? JSON.parse(data) : [];
  }

  clearHistory(): void {
    localStorage.removeItem('historial');
    this.historial = [];
  }
}
