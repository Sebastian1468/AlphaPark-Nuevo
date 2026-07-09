import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Rol } from '../../services/auth';

@Component({
  selector: 'app-crear-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-cuenta.html',
  styleUrls: ['./crear-cuenta.css']
})
export class CrearCuentaComponent {
  nombreUsuario: string = '';
  password: string = '';
  confirmarPassword: string = '';
  rol: Rol = 'Empleado';
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  seleccionarRol(rol: Rol): void {
    this.rol = rol;
  }

  registrar(): void {
    this.error = '';
    this.exito = '';

    if (!this.nombreUsuario || !this.password || !this.confirmarPassword) {
      this.error = 'Completa todos los campos.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.auth.registrar(this.nombreUsuario.trim(), this.password, this.rol).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = 'Cuenta creada con éxito. Ya puedes iniciar sesión.';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo conectar con el servidor.';
      }
    });
  }
}
