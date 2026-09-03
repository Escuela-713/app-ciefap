import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { authGuard } from './guards/auth.guard';
import { Historial } from './pages/historial/historial';
import { About } from './pages/about/about';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalculatorComponent } from './pages/calculator/calculator.component';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'historial', component: Historial },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
