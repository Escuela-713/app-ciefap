import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  isRegisterActive = false;
  loginForm: FormGroup;
  mostrarcontra = false;

  toggleContra() {
    this.mostrarcontra = !this.mostrarcontra;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
  ) {
    // login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      contraseña: ['', [Validators.required]],
    });
  }

  // Getters
  get Email() {
    return this.loginForm.get('email');
  }
  get Password() {
    return this.loginForm.get('contraseña');
  }

  toggleMode(): void {
    this.router.navigate(['/registro']);
  }

  onEnviar(event: Event) {
    event.preventDefault();

    if (this.loginForm.valid) {
      const { email, contraseña } = this.loginForm.value;

      if (this.auth.login(email, contraseña)) {
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Hola ${email}!`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/dashboard']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Campos inválidos',
          text: 'Por favor, completá todos los campos correctamente.',
        });
        this.loginForm.markAllAsTouched();
      }
    }
  }
}
