import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.html',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule],
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  showLogin = true;
  loginForm: FormGroup;
  providers: any = {};

  constructor(private fb: FormBuilder, private router: Router, private loginService: AuthService, private http: HttpClient) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contraseña: ['', Validators.required],
    });
  }

  //inicio de sesion con google etc

  ngOnInit(): void {
  this.http.get<any[]>('https://backend-9s6b.onrender.com/api/auth/oauth/providers')
    .subscribe({
      next: res => {
        // Convertir array a objeto
        this.providers = res.reduce((acc, p) => {
          acc[p.name] = p.authorization_url;
          return acc;
        }, {} as Record<string, string>);
      },
      error: err => console.error('Error al obtener proveedores', err)
    });
}

  loginCon(proveedor: string) {
  const url = this.providers[proveedor];
  if (url) {
    window.location.href = url;
  } else {
    alert('Proveedor no disponible: ' + proveedor);
  }
}

  toggle(): void {
    this.showLogin = !this.showLogin;
  }

  get Password() {
    return this.loginForm.get('contraseña');
  }

  get Username() {
    return this.loginForm.get('usuario');
  }

  onEnviar(event: Event) {
    if (this.loginForm.valid) {
      alert('Bien, pudiste ingresar');
    } else {
      alert('Lo siento, verifica que los datos sean correctos');
    }
  }

  onLogin(event: Event) {
    event.preventDefault();
    const { usuario, contraseña } = this.loginForm.value;

    this.loginService.login(usuario, contraseña).subscribe({
  next: (respuesta) => {
    console.log(respuesta);
    if (respuesta.access_token) {
      localStorage.setItem('access_token', respuesta.access_token);
      localStorage.setItem('usuario', JSON.stringify(respuesta));
      localStorage.setItem('rol', respuesta.rol);
      localStorage.setItem('nombre', respuesta.apellido);

      if (respuesta.rol === 'administrador') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/productos']);
      }

    } else {
    }
  },
  error: (error) => {
    console.error('Error en login:', error);
    Swal.fire({
      icon: 'error',
      title: 'Inicio de sesión fallido',
      text: 'Usuario o contraseña mal escritas',
      confirmButtonText: 'Intentar de nuevo'
    });
  },
  complete: () => {
    console.info('Login completo');
    this.loginForm.reset();
  }
});
  
}

  goToRegister(): void {
    this.router.navigate(['/auth/registro']);
  }
}


