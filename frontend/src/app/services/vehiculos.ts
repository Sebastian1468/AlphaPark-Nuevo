import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VehiculoResumen {
  placa: string;
  tipo: string;
  visitas: number;
  total_gastado: number;
  ultima_visita: string | null;
  esta_activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient) {}

  buscar(termino: string = ''): Observable<VehiculoResumen[]> {
    return this.http.get<VehiculoResumen[]>(`${this.apiUrl}?buscar=${encodeURIComponent(termino)}`);
  }

  getHistorialPorPlaca(placa: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${encodeURIComponent(placa)}/historial`);
  }
}
