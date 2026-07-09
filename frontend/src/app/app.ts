import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'AlphaPark';

  constructor(public auth: AuthService, private router: Router) {
    // Forzamos detección de cambios en la navegación para refrescar
    // el header/nav apenas cambia la sesión (login, logout, cambio de rol).
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // no-op: solo dispara change detection al re-evaluar los getters de auth
      }
    });
  }

  get mostrarShell(): boolean {
    return this.auth.estaLogueado();
  }

  get esGerente(): boolean {
    return this.auth.esGerente();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
