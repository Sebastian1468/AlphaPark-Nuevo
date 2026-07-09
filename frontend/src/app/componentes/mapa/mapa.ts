import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParqueoService, EstadoParqueo } from '../../services/parqueo';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css']
})
export class MapaComponent implements OnInit {
  estado: EstadoParqueo = {
    capacidad_total: 0,
    espacios_ocupados: 0,
    disponibles: 0,
    estaLleno: false,
    tarifa_por_hora: 0
  };
  slots: number[] = [];
  cargando: boolean = true;
  error: string = '';

  constructor(private parqueoService: ParqueoService) {}

  ngOnInit(): void {
    this.parqueoService.getAforo().subscribe({
      next: (data) => {
        this.estado = data;
        // Generamos la cuadrícula visual: los primeros N espacios se
        // muestran ocupados (no tenemos una posición física real por
        // espacio en la base de datos, solo el contador total).
        this.slots = Array.from({ length: data.capacidad_total }, (_, i) => i + 1);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor.';
        this.cargando = false;
      }
    });
  }

  esOcupado(slot: number): boolean {
    return slot <= this.estado.espacios_ocupados;
  }

  get porcentajeOcupacion(): number {
    if (!this.estado.capacidad_total) return 0;
    return Math.round((this.estado.espacios_ocupados / this.estado.capacidad_total) * 1000) / 10;
  }
}
