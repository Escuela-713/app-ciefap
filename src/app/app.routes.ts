import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login} from './auth/login/login';
import { Registro } from './auth/registro/registro';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login}, 
  { path: 'registro', component: Registro},
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
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
