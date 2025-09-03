import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})


export class Registro  {
  showRegister = true

  registerForm: FormGroup;

 
  constructor(private fb: FormBuilder, private router:Router, private authService: AuthService) {
      this.registerForm = this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        usuario: ['', Validators.required],
        contraseña: ['', Validators.required],
        confirmar_contraseña: ['', Validators.required]
    }); 
  }
  



  get Nombre() {
   return this.registerForm.get('nombre');
  }

  get Apellido() {
   return this.registerForm.get('apellido');
  }

  get Email() {
   return this.registerForm.get('email');
  }

  get Usuario(){
    return this.registerForm.get('usuario');
  }

  get Password() {
  return this.registerForm.get('contraseña');
  }

  get ConfirmPassword() {
    return this.registerForm.get('confirmar_contraseña')
  }

  onRegister(event: Event) {
  event.preventDefault();

  const password = this.registerForm.get('contraseña')?.value;
  const confirmPassword = this.registerForm.get('confirmar_contraseña')?.value;

  if (this.registerForm.valid && password === confirmPassword) {
    const registroData = {
      nombre: this.registerForm.get('nombre')?.value,
      apellido: this.registerForm.get('apellido')?.value,
      email: this.registerForm.get('email')?.value,
      usuario: this.registerForm.get('usuario')?.value,
      contraseña: password 
    };

    this.authService.registrarUsuario(registroData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          confirmButtonText: 'Iniciar sesión'
        }).then(() => {
          this.router.navigate(['/auth']);
        });
      },
      error: (err) => {
        
        Swal.fire({
      icon: 'error',
      title: 'Error al registrar',
      
      confirmButtonText: 'Aceptar'
  });
}
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
    this.router.navigate(['/auth']);
  }

}
