import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Header } from './shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isDarkMode = false;
  showBackButton = false;

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    }
    
    // Verificar si estamos en una página interna para mostrar el botón de regreso
    this.router.events.subscribe(() => {
      this.showBackButton = this.router.url !== '/';
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  goBack(): void {
    this.location.back();
  }
}
