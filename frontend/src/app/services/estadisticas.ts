import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Periodo = 'dia' | 'semana' | 'mes' | 'anio';

export interface ResumenGerente {
  capacidad_total: number;
  espacios_ocupados: number;
  disponibles: number;
  tarifa_por_hora: number;
  ingresos_hoy: number;
  ingresos_mes: number;
  vehiculos_hoy: number;
  ticket_promedio: number;
}

export interface PuntoGanancia {
  etiqueta: string;
  total: number;
}

export interface PuntoHoraPico {
  hora: number;
  etiqueta: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getResumen(): Observable<ResumenGerente> {
    return this.http.get<ResumenGerente>(`${this.apiUrl}/estadisticas/resumen`);
  }

  getGanancias(periodo: Periodo): Observable<PuntoGanancia[]> {
    return this.http.get<PuntoGanancia[]>(`${this.apiUrl}/estadisticas/ganancias?periodo=${periodo}`);
  }

  getHoraPico(): Observable<PuntoHoraPico[]> {
    return this.http.get<PuntoHoraPico[]>(`${this.apiUrl}/estadisticas/hora-pico`);
  }

  actualizarConfig(tarifa_por_hora?: number, capacidad_total?: number): Observable<any> {
    const body: any = {};
    if (tarifa_por_hora != null) body.tarifa_por_hora = tarifa_por_hora;
    if (capacidad_total != null) body.capacidad_total = capacidad_total;
    return this.http.put(`${this.apiUrl}/parqueo/config`, body);
  }
}
