import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type Rol = 'Empleado' | 'Gerente';

export interface Usuario {
  id_operador: number;
  nombre_usuario: string;
  rol: Rol;
}

const STORAGE_KEY = 'alphapark_usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient) {
    this.usuarioActual = this.leerDeStorage();
  }

  private leerDeStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(nombre_usuario: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, { nombre_usuario, password }).pipe(
      tap(usuario => this.guardarSesion(usuario))
    );
  }

  registrar(nombre_usuario: string, password: string, rol: Rol): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, { nombre_usuario, password, rol });
  }

  guardarSesion(usuario: Usuario): void {
    this.usuarioActual = usuario;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  }

  logout(): void {
    this.usuarioActual = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  getUsuario(): Usuario | null {
    if (!this.usuarioActual) {
      this.usuarioActual = this.leerDeStorage();
    }
    return this.usuarioActual;
  }

  estaLogueado(): boolean {
    return !!this.getUsuario();
  }

  esGerente(): boolean {
    return this.getUsuario()?.rol === 'Gerente';
  }

  esEmpleado(): boolean {
    return this.getUsuario()?.rol === 'Empleado';
  }
}
