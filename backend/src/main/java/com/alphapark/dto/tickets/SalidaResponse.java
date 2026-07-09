package com.alphapark.dto.tickets;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class SalidaResponse {
    private String message;
    private Integer idTicket;
    private String placa;
    private long duracionMinutos;
    private BigDecimal monto;
}
