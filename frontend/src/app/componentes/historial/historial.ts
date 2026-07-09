import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParqueoService } from '../../services/parqueo';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrls: ['./historial.css']
})
export class HistorialComponent implements OnInit {
  registros: any[] = [];
  kpis = {
    total_registros: 0,
    salidas_hoy: 0,
    ingresos_totales: 0,
    duracion_promedio_horas: 0
  };
  busqueda: string = '';
  fechaFiltro: string = '';
  cargando: boolean = true;
  error: string = '';

  constructor(private parqueoService: ParqueoService) {}

  ngOnInit(): void {
    this.parqueoService.getHistorial().subscribe({
      next: (data) => {
        this.registros = data.registros;
        this.kpis = data.kpis;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor.';
        this.cargando = false;
      }
    });
  }

  get registrosFiltrados(): any[] {
    const termino = this.busqueda.trim().toLowerCase();
    return this.registros.filter(r => {
      const coincideTexto = !termino ||
        r.placa_vehiculo.toLowerCase().includes(termino) ||
        String(r.id_ticket).includes(termino);
      const coincideFecha = !this.fechaFiltro || r.fecha_ingreso === this.fechaFiltro;
      return coincideTexto && coincideFecha;
    });
  }

  formatDuracion(minutos: number): string {
    if (minutos == null) return '-';
    if (minutos < 60) return '< 1h';
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}m`;
  }

  exportarCSV(): void {
    const filas = this.registrosFiltrados;
    if (filas.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const encabezado = ['Ticket', 'Placa', 'Entrada', 'Salida', 'Duracion (min)', 'Cobro'];
    const lineas = filas.map(r => [
      `AP-${String(r.id_ticket).padStart(6, '0')}`,
      r.placa_vehiculo,
      `${r.fecha_ingreso} ${r.hora_ingreso}`,
      `${r.fecha_salida} ${r.hora_salida}`,
      r.duracion_minutos,
      r.monto_pagado
    ].join(','));

    const csv = [encabezado.join(','), ...lineas].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alphapark-historial-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
