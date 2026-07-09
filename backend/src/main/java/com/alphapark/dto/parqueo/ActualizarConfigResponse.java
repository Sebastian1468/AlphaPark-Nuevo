package com.alphapark.dto.parqueo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class ActualizarConfigResponse {
    private String message;
    private Integer capacidadTotal;
    private BigDecimal tarifaPorHora;
}
