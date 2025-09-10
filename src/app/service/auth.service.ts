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
export class AuthService {
  apiUrl = 'https://backend-9s6b.onrender.com/api/auth';


  constructor(private http: HttpClient) {}

  verificarUsuario(nombreUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar/${nombreUsuario}`);
  }

  login(usuario: string, contraseña: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
    usuario,
    contraseña,
  }).pipe(
    tap(respuesta => {
      this.guardarSesion(respuesta.access_token);
      //guardamos los datos que nos pasa el usuario en el localstorage
        if (respuesta.usuario) {
        const usuarioCompleto = {
        usuario: respuesta.usuario,
        rol: respuesta.rol,
        nombre: respuesta.nombre,
        apellido: respuesta.apellido,
        email: respuesta.email,
        id: respuesta.usuario_id
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
    }
    }),
  );
  }
  
  registrarUsuario(registroData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, registroData);
  }

  estaAutenticado(): boolean {
  return !!localStorage.getItem('access_token');
  }


  guardarSesion(token: string): void {
    localStorage.setItem('access_token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }
  //guardar usuarios, nombre, etc, para la creacion de la pagina del perfil, etc.
  get usuarioActual(): string | null {
    const raw = localStorage.getItem('usuario');
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.usuario || null;
    } catch {
      return null;
    }
  }

  get usuarioId(): number | null {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario ? usuario.id : null;
  }

  getRol(): string | null {
    const raw = localStorage.getItem('usuario');
    try {
      const usuario = raw ? JSON.parse(raw) : null;
      return usuario?.rol || null;
    } catch {
      return null;
    }
  }

  get usuario(): any | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  get usuarioCompleto(): LoginResponse | null {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
  //cerrar sesión 
  cerrarSesion(): void {
  localStorage.removeItem('usuario');
  localStorage.removeItem('access_token');
  }

  cambiarContraseña(usuarioId: number, datos: any): Observable<any> {
    return this.http.put(`https://backend-9s6b.onrender.com/api/usuarios/cambiar-password/${usuarioId}`, datos);
  }

  verificarUsuarioConToken(token: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any>('https://backend-9s6b.onrender.com/api/auth/usuario/me', { headers });
  }


}

  

