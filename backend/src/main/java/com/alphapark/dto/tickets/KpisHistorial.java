package com.alphapark.dto.tickets;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class KpisHistorial {
    private long totalRegistros;
    private long salidasHoy;
    private BigDecimal ingresosTotales;
    private double duracionPromedioHoras;
}
