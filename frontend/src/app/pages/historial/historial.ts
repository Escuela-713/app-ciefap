import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-historial',
  imports: [CommonModule, RouterLink],
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
