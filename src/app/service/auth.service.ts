import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';


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
export class AuthService {}

  

