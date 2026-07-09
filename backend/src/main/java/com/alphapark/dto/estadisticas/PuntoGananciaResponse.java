package com.alphapark.dto.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class PuntoGananciaResponse {
    private String etiqueta;
    private BigDecimal total;
}
