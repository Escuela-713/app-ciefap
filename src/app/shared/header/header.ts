import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, RouterLink, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit{
  
  isLoggedIn = false;
  menuOpen = false; 

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(){
    this.auth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
  

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  login(){
    this.isLoggedIn = true;

  }
  
}
