package com.alphapark.dto.tickets;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class TicketActivoResponse {
    private Integer idTicket;
    private String placaVehiculo;
    private LocalDate fechaIngreso;
    private LocalTime horaIngreso;
    private long minutosTranscurridos;
    private String horasTexto;
    private BigDecimal cobroEstimado;
}
