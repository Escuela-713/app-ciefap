import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiar-contra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contra.html',
  styleUrls: ['./cambiar-contra.css']
})
export class CambiarContraComponent {
  changePasswordForm: FormGroup;
  mensaje: string = '';
  esError: boolean = false;

  passwordMatchValidator = (form: FormGroup) => {
    const nueva = form.get('contraseña_nueva')?.value;
    const confirmar = form.get('confirmar_contraseña')?.value;
    return nueva === confirmar ? null : { mismatch: true };
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.changePasswordForm = this.fb.group({
      contraseña_actual: ['', Validators.required],
      contraseña_nueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contraseña: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      const usuarioId = this.authService.usuarioId;
      if (usuarioId) {
        this.authService.cambiarContraseña(usuarioId, this.changePasswordForm.value).subscribe({
          next: (res) => {
            this.mensaje = 'Contraseña cambiada con éxito';
            this.esError = false;
            
            // Esperar 2 segundos
            setTimeout(() => {
              this.authService.cerrarSesion();
              this.router.navigate(['/auth']);
            }, 2000);
          },
          error: (err) => {
            this.mensaje = err.error.detail || 'Error al cambiar la contraseña';
            this.esError = true;
          }
        });
      } else {
        this.mensaje = 'Usuario no autenticado';
        this.esError = true;
      }
    } else {
      this.mensaje = 'Por favor, complete el formulario correctamente.';
      this.esError = true;
    }
  }
}
