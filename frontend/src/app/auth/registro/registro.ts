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
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contraseña: ['', Validators.required]
    });
  }

  // Getters para validaciones en el template
  get Nombre() { return this.registerForm.get('nombre'); }
  get Usuario() { return this.registerForm.get('usuario'); }
  get Email() { return this.registerForm.get('email'); }
  get Password() { return this.registerForm.get('contraseña'); }
  get ConfirmPassword() { return this.registerForm.get('confirmar_contraseña'); }

  onregister(event: Event) {
    event.preventDefault();

    const password = this.Password?.value;
    const confirmPassword = this.ConfirmPassword?.value;

    if (this.registerForm.valid && password === confirmPassword) {
      if (this.registerForm.valid && password === confirmPassword) {
        const registroData = {
        nombre: this.registerForm.get('nombre')?.value,
        apellido: this.registerForm.get('apellido')?.value,
        email: this.registerForm.get('email')?.value,
        usuario: this.registerForm.get('usuario')?.value,
        contraseña: password 
    };


      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada correctamente.',
        confirmButtonText: 'Iniciar sesión'
      }).then(() => {
        this.router.navigate(['/login']);
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
  }
  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}

