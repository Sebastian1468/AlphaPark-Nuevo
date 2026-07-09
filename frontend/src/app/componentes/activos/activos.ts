import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParqueoService, TicketActivo } from '../../services/parqueo';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activos.html',
  styleUrls: ['./activos.css']
})
export class ActivosComponent implements OnInit {
  activos: TicketActivo[] = [];
  busqueda: string = '';
  cargando: boolean = true;
  error: string = '';

  constructor(private parqueoService: ParqueoService) {}

  ngOnInit(): void {
    this.cargarActivos();
  }

  cargarActivos(): void {
    this.cargando = true;
    this.parqueoService.getActivos().subscribe({
      next: (data) => {
        this.activos = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor.';
        this.cargando = false;
      }
    });
  }

  get activosFiltrados(): TicketActivo[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.activos;
    return this.activos.filter(a =>
      a.placa_vehiculo.toLowerCase().includes(termino) ||
      String(a.id_ticket).includes(termino)
    );
  }

  registrarSalida(ticket: TicketActivo): void {
    if (!confirm(`¿Confirmas la salida del vehículo ${ticket.placa_vehiculo}?`)) return;

    this.parqueoService.registrarSalida(ticket.id_ticket).subscribe({
      next: (res) => {
        alert(`Salida registrada.\nPlaca: ${res.placa}\nCobro final: $${res.monto}`);
        this.cargarActivos();
      },
      error: (err) => {
        alert(err?.error?.message || 'Error al registrar la salida.');
      }
    });
  }
}
