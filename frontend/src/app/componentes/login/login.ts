import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  nombreUsuario: string = '';
  password: string = '';
  cargando: boolean = false;
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ingresar(): void {
    this.error = '';
    if (!this.nombreUsuario || !this.password) {
      this.error = 'Ingresa tu usuario y contraseña.';
      return;
    }

    this.cargando = true;
    this.auth.login(this.nombreUsuario.trim(), this.password).subscribe({
      next: (usuario) => {
        this.cargando = false;
        if (usuario.rol === 'Gerente') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/registro']);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo conectar con el servidor.';
      }
    });
  }
}
