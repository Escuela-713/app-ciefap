import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'calculator',
    loadComponent: () =>
      import('./pages/calculator/calculator.component').then(m => m.CalculatorComponent),
  },
  { path: '**', redirectTo: 'dashboard' }
];
