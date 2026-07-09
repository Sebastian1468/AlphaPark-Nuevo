import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParqueoService } from '../../services/parqueo';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  placaVehiculo: string = '';

  constructor(private parqueoService: ParqueoService, private auth: AuthService) {}

  generarTicket() {
    if (!this.placaVehiculo) {
      alert('Por favor, ingresa una placa válida.');
      return;
    }

    const idOperador = this.auth.getUsuario()?.id_operador;
    if (!idOperador) {
      alert('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    // Enviando los datos reales de tu input hacia Node.js -> MySQL
    this.parqueoService.registrarIngreso(this.placaVehiculo, idOperador).subscribe({
      next: (res) => {
        alert(`¡Ticket Generado Exitosamente en MySQL!\nID Ticket: ${res.id_ticket}\nHora: ${res.hora}`);
        this.placaVehiculo = ''; // Limpiar la caja de texto
      },
      error: (err) => {
        alert(err?.error?.message || 'Error al conectar con el servidor.');
      }
    });
  }
}