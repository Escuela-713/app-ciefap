import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login} from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { authGuard } from './guards/auth.guard';
import { Developers } from './pages/developers/developers';
import { Historial } from './pages/historial/historial';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalculatorComponent } from './pages/calculator/calculator.component';
import { ForestDataComponent } from './pages/forest-data/forest-data.component';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login}, 
  { path: 'registro', component: Registro},
  { path: 'dev', component: Developers},
  { path: 'historial', component: Historial},
  { path: 'dashboad', component: DashboardComponent}, 
  { path: 'calculator', component: CalculatorComponent},
  { path: 'forest-data', component: ForestDataComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
