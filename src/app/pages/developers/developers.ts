import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';


interface Developer {
  nombre: string;
  rol: string;
  foto: string; 
  github: string;
  linkedin: string;
}

@Component({
  selector: 'app-developers',
  imports: [NgFor],
  templateUrl: './developers.html',
  styleUrl: './developers.css'
})
export class Developers {
 developers: Developer[] = [
    {
      nombre: 'Juan Montaño',
      rol: 'Frontend Developer',
      foto: 'developers/juan.jpg',
      github: 'https://github.com/jjuann12',
      linkedin: 'https://www.linkedin.com/in/juan-ignacio-monta%C3%B1o-a53a9a367/'
    },
    {
      nombre: 'Juan Montaño',
      rol: 'Frontend Developer',
      foto: 'imagenes/bosques5.jpg',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
  ]
  }
