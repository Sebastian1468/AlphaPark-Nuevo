package com.alphapark.dto.tickets;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class IngresoResponse {
    private String message;
    private Integer idTicket;
    private String placa;
    private Integer idOperador;
    private LocalDate fecha;
    private LocalTime hora;
}
