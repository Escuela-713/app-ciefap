import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login} from './auth/login/login';
import { Registro } from './auth/registro/registro';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: Login}, 
    { path: 'registro', component: Registro}
];
