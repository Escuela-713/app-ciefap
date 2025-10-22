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
  styleUrls: ['./login.css']
})
export class Login {
  isRegisterActive = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private auth : AuthService) {
    // loginnn
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contraseña: ['', [Validators.required]]
    });

    // registroo
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contraseña: ['', Validators.required]
    });
  }

  // Getters
  get Usuario() { return this.loginForm.get('usuario'); }
  get Password() { return this.loginForm.get('contraseña'); }
  get Nombre() { return this.registerForm.get('nombre'); }
  get RegUsuario() { return this.registerForm.get('usuario'); }
  get Email() { return this.registerForm.get('email'); }
  get RegPassword() { return this.registerForm.get('contraseña'); }
  get ConfirmPassword() { return this.registerForm.get('confirmar_contraseña'); }

  toggleMode() {
    this.isRegisterActive = !this.isRegisterActive;
  }

  onEnviar(event: Event) {
    event.preventDefault();

    
    if (this.loginForm.valid) {
      const { usuario, contraseña } = this.loginForm.value;

      if (this.auth.login(usuario,contraseña)){
      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola ${usuario}!`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/dashboard']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Campos inválidos',
        text: 'Por favor, completá todos los campos correctamente.'
      });
      this.loginForm.markAllAsTouched();
    }
    }
  }

  onRegister(event: Event) {
    event.preventDefault();

    const password = this.registerForm.get('contraseña')?.value;
    const confirmPassword = this.registerForm.get('confirmar_contraseña')?.value;

    if (this.registerForm.valid && password === confirmPassword) {
      const data = this.registerForm.value;
      console.log('Registro exitoso:', data);

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada correctamente.',
        confirmButtonText: 'Iniciar sesión'
      }).then(() => {
        this.isRegisterActive = false;
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Datos inválidos',
        text: 'Las contraseñas no coinciden o hay campos incompletos.'
      });
      this.registerForm.markAllAsTouched();
    }
  }
}

