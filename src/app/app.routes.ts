import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login} from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { authGuard } from './guards/auth.guard';
import { Developers } from './pages/developers/developers';
import { Historial } from './pages/historial/historial';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login}, 
  { path: 'registro', component: Registro},
  { path: 'dev', component: Developers},
  { path: 'historial', component: Historial},
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'calculator',
    loadComponent: () =>
      import('./pages/calculator/calculator.component').then(m => m.CalculatorComponent)
  },
  {
    path: 'forest-data',
    loadComponent: () =>
      import('./pages/forest-data/forest-data.component').then(m => m.ForestDataComponent)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
