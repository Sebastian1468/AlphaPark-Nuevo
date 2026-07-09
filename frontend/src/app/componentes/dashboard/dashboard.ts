import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticasService, ResumenGerente, Periodo } from '../../services/estadisticas';
import { ParqueoService } from '../../services/parqueo';
import { VehiculosService, VehiculoResumen } from '../../services/vehiculos';
import { AuthService } from '../../services/auth';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('graficoGanancias') graficoGananciasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoHoraPico') graficoHoraPicoRef!: ElementRef<HTMLCanvasElement>;

  resumen: ResumenGerente = {
    capacidad_total: 0,
    espacios_ocupados: 0,
    disponibles: 0,
    tarifa_por_hora: 0,
    ingresos_hoy: 0,
    ingresos_mes: 0,
    vehiculos_hoy: 0,
    ticket_promedio: 0
  };

  periodoSeleccionado: Periodo = 'dia';
  cargandoResumen = true;
  errorResumen = '';

  private chartGanancias: any = null;
  private chartHoraPico: any = null;
  private vistaLista = false;

  // Configuración de tarifa
  nuevaTarifa: number | null = null;
  nuevaCapacidad: number | null = null;
  guardandoConfig = false;
  mensajeConfig = '';

  // Buscador de vehículos
  busquedaVehiculo = '';
  vehiculosEncontrados: VehiculoResumen[] = [];
  buscandoVehiculos = false;
  vehiculoSeleccionado: VehiculoResumen | null = null;
  historialVehiculo: any[] = [];

  // Historial de transacciones
  transacciones: any[] = [];
  busquedaTransaccion = '';
  cargandoTransacciones = true;

  constructor(
    private estadisticasService: EstadisticasService,
    private parqueoService: ParqueoService,
    private vehiculosService: VehiculosService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarTransacciones();
    this.buscarVehiculos();
  }

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.cargarGraficoGanancias();
    this.cargarGraficoHoraPico();
  }

  cargarResumen(): void {
    this.cargandoResumen = true;
    this.estadisticasService.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.nuevaTarifa = data.tarifa_por_hora;
        this.nuevaCapacidad = data.capacidad_total;
        this.cargandoResumen = false;
      },
      error: () => {
        this.errorResumen = 'No se pudo conectar con el servidor.';
        this.cargandoResumen = false;
      }
    });
  }

  cambiarPeriodo(periodo: Periodo): void {
    this.periodoSeleccionado = periodo;
    this.cargarGraficoGanancias();
  }

  cargarGraficoGanancias(): void {
    if (!this.vistaLista) return;
    this.estadisticasService.getGanancias(this.periodoSeleccionado).subscribe({
      next: (puntos) => {
        const etiquetas = puntos.map(p => p.etiqueta);
        const totales = puntos.map(p => p.total);

        if (this.chartGanancias) {
          this.chartGanancias.data.labels = etiquetas;
          this.chartGanancias.data.datasets[0].data = totales;
          this.chartGanancias.update();
          return;
        }

        this.chartGanancias = new Chart(this.graficoGananciasRef.nativeElement, {
          type: 'line',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'Dinero recaudado ($)',
              data: totales,
              borderColor: '#0A58CA',
              backgroundColor: 'rgba(10, 88, 202, 0.12)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#0A58CA',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (v: any) => '$' + v } }
            }
          }
        });
      },
      error: () => {}
    });
  }

  cargarGraficoHoraPico(): void {
    if (!this.vistaLista) return;
    this.estadisticasService.getHoraPico().subscribe({
      next: (puntos) => {
        const etiquetas = puntos.map(p => p.etiqueta);
        const cantidades = puntos.map(p => p.cantidad);

        if (this.chartHoraPico) {
          this.chartHoraPico.data.labels = etiquetas;
          this.chartHoraPico.data.datasets[0].data = cantidades;
          this.chartHoraPico.update();
          return;
        }

        this.chartHoraPico = new Chart(this.graficoHoraPicoRef.nativeElement, {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'Vehículos ingresados',
              data: cantidades,
              backgroundColor: '#6f42c1',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      },
      error: () => {}
    });
  }

  guardarConfig(): void {
    this.mensajeConfig = '';
    if (!this.nuevaTarifa || this.nuevaTarifa <= 0) {
      this.mensajeConfig = 'La tarifa debe ser mayor a 0.';
      return;
    }

    this.guardandoConfig = true;
    this.estadisticasService.actualizarConfig(this.nuevaTarifa, this.nuevaCapacidad ?? undefined).subscribe({
      next: () => {
        this.guardandoConfig = false;
        this.mensajeConfig = 'Configuración actualizada con éxito.';
        this.cargarResumen();
      },
      error: (err) => {
        this.guardandoConfig = false;
        this.mensajeConfig = err?.error?.message || 'No se pudo actualizar la configuración.';
      }
    });
  }

  buscarVehiculos(): void {
    this.buscandoVehiculos = true;
    this.vehiculosService.buscar(this.busquedaVehiculo).subscribe({
      next: (data) => {
        this.vehiculosEncontrados = data;
        this.buscandoVehiculos = false;
      },
      error: () => {
        this.buscandoVehiculos = false;
      }
    });
  }

  verHistorialVehiculo(v: VehiculoResumen): void {
    this.vehiculoSeleccionado = v;
    this.vehiculosService.getHistorialPorPlaca(v.placa).subscribe({
      next: (data) => (this.historialVehiculo = data),
      error: () => (this.historialVehiculo = [])
    });
  }

  cerrarHistorialVehiculo(): void {
    this.vehiculoSeleccionado = null;
    this.historialVehiculo = [];
  }

  cargarTransacciones(): void {
    this.cargandoTransacciones = true;
    this.parqueoService.getHistorial().subscribe({
      next: (data) => {
        this.transacciones = data.registros;
        this.cargandoTransacciones = false;
      },
      error: () => {
        this.cargandoTransacciones = false;
      }
    });
  }

  get transaccionesFiltradas(): any[] {
    const termino = this.busquedaTransaccion.trim().toLowerCase();
    if (!termino) return this.transacciones;
    return this.transacciones.filter(t =>
      t.placa_vehiculo.toLowerCase().includes(termino) ||
      String(t.id_ticket).includes(termino)
    );
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
