import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
    showLogin = true;
    loginForm: FormGroup;
  
    constructor(private router: Router, private fb: FormBuilder){
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contraseña: ['', [Validators.required]]
    });
  }
// aca estoy declarando los gets 
  get Usuario() {
    return this.loginForm.get('usuario');
  }

  get Password() {
    return this.loginForm.get('contraseña');
  }

  //este es para el boton que esta en el html
  goRegister(): void {
    this.router.navigate(['/registro']);
  }

  // este es para el metodo del boton en el form 
  onEnviar(event: Event) {
     event.preventDefault();

     const usuario = this.Usuario?.value;
     const contraseña = this.Password?.value;
      
     console.log(this.loginForm.valid)
     if (this.loginForm.valid ){
        const registroDate = {
          usuario:  this.loginForm.get('usuario')?.value,
          contraseña: this.loginForm.get('contraseña')?.value,
        };
        this.router.navigateByUrl("/home")
      } else {
        alert('no entraste')
      }
     }


  }

