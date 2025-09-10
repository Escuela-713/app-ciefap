import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {

  showRegister = true;
  registerForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get Nombre() { return this.registerForm.get('nombre'); }
  get Apellido() { return this.registerForm.get('apellido'); }
  get Usuario() { return this.registerForm.get('usuario'); }
  get Email() { return this.registerForm.get('email'); }
  get Contraseña() { return this.registerForm.get('password'); }
  get ConfirmarContraseña() { return this.registerForm.get('confirmPassword'); }

  onregister(event: Event) {
    event.preventDefault(); // ⚠ importante

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (this.registerForm.valid && password === confirmPassword) {
      // Aquí normalmente enviarías datos al backend
      // Por ahora solo mostramos el mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada correctamente.',
        confirmButtonText: 'Iniciar sesión'
      }).then(() => {
        this.router.navigate(['/login']); // redirige al login
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Datos inválidos',
        text: 'Las contraseñas no coinciden o hay campos incompletos.',
        confirmButtonText: 'Revisar'
      });
      this.registerForm.markAllAsTouched();
    }
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}

