import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParqueoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // 1. Obtener el aforo de la base de datos
  getAforo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/parqueo/estado`);
  }

  registrarIngreso(placa: string, idOperador: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/ingreso`, {
      placa_vehiculo: placa,
      id_operador: idOperador
    });
  }
}