import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';


export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: string;
  rol: string;
  email: string;
  nombre: string;
  apellido: string;
  usuario_id: number
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly validUser = 'admin';
  private readonly validPassword = 'admin';

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor (){}

  login(usuario: string, contraseña: string): boolean {
    const success = usuario === this.validUser && contraseña === this.validPassword;
    this.loggedIn.next(success);
    return success;
  }

  logout() {
    this.loggedIn.next(false);
  }

}

  

