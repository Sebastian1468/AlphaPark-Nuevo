package com.alphapark.dto.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class ResumenResponse {
    private Integer capacidadTotal;
    private Integer espaciosOcupados;
    private Integer disponibles;
    private BigDecimal tarifaPorHora;
    private BigDecimal ingresosHoy;
    private BigDecimal ingresosMes;
    private long vehiculosHoy;
    private BigDecimal ticketPromedio;
}
