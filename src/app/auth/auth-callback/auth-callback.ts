import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  template: '<div>Procesando autenticación...</div>',
  standalone: true
})
export class AuthCallback implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Implementación del callback de autenticación
    // Normalmente redirige al usuario después de procesar el token
    this.router.navigate(['/productos']);
  }
}