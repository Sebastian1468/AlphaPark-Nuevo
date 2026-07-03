import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; 
import { ParqueoService } from '../../services/parqueo';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  placaVehiculo: string = '';
  idOperadorActivo: number = 1; 

  constructor(private parqueoService: ParqueoService) {}

  generarTicket() {
    if (!this.placaVehiculo) {
      alert('Por favor, ingresa una placa válida.');
      return;
    }

    // Enviando los datos reales de tu input hacia Node.js -> MySQL
    this.parqueoService.registrarIngreso(this.placaVehiculo, this.idOperadorActivo).subscribe({
      next: (res) => {
        alert(`¡Ticket Generado Exitosamente en MySQL!\nID Ticket: ${res.id_ticket}\nHora: ${res.hora}`);
        this.placaVehiculo = ''; // Limpiar la caja de texto
      },
      error: (err) => {
        alert(err.error.message || 'Error al conectar con el servidor.');
      }
    });
  }
}