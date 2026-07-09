import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadoParqueo {
  capacidad_total: number;
  espacios_ocupados: number;
  disponibles: number;
  estaLleno: boolean;
  tarifa_por_hora: number;
}

export interface TicketActivo {
  id_ticket: number;
  placa_vehiculo: string;
  fecha_ingreso: string;
  hora_ingreso: string;
  minutos_transcurridos: number;
  horas_texto: string;
  cobro_estimado: number;
}

export interface HistorialResponse {
  kpis: {
    total_registros: number;
    salidas_hoy: number;
    ingresos_totales: number;
    duracion_promedio_horas: number;
  };
  registros: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ParqueoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // 1. Obtener el aforo de la base de datos
  getAforo(): Observable<EstadoParqueo> {
    return this.http.get<EstadoParqueo>(`${this.apiUrl}/parqueo/estado`);
  }

  registrarIngreso(placa: string, idOperador: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/ingreso`, {
      placa_vehiculo: placa,
      id_operador: idOperador
    });
  }

  // 2. Obtener los vehículos actualmente dentro del estacionamiento
  getActivos(): Observable<TicketActivo[]> {
    return this.http.get<TicketActivo[]>(`${this.apiUrl}/tickets/activos`);
  }

  // 3. Registrar la salida de un vehículo (libera el espacio y calcula el cobro final)
  registrarSalida(idTicket: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/tickets/${idTicket}/salida`, {});
  }

  // 4. Obtener el historial de salidas + KPIs para el dashboard
  getHistorial(): Observable<HistorialResponse> {
    return this.http.get<HistorialResponse>(`${this.apiUrl}/tickets/historial`);
  }
}
