package com.alphapark.dto.vehiculos;

import com.alphapark.model.EstadoTicket;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/** Historial completo de tickets de una placa (GET /api/vehiculos/{placa}/historial). */
@Getter
@Setter
@AllArgsConstructor
public class TicketVehiculoItem {
    private Integer idTicket;
    private String placaVehiculo;
    private LocalDate fechaIngreso;
    private LocalTime horaIngreso;
    private LocalDate fechaSalida;
    private LocalTime horaSalida;
    private BigDecimal montoPagado;
    private EstadoTicket estado;
}
