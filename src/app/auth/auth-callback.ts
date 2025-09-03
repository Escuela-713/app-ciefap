import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Iniciando sesión...</p>'
})
export class AuthCallback implements OnInit {

   constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.authService.guardarSesion(token);

      // ⚠️ Recomendado: Llamar al backend para obtener los datos del usuario
      this.authService.verificarUsuarioConToken(token).subscribe({
        next: (usuario) => {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.router.navigate(['/productos']); // o al home
        },
        error: () => {
          this.router.navigate(['/auth']);
        }
      });
    } else {
      this.router.navigate(['/auth']);
    }
  }
}