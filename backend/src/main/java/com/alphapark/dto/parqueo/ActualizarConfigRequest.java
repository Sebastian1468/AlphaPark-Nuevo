package com.alphapark.dto.parqueo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ActualizarConfigRequest {
    private BigDecimal tarifaPorHora;
    private Integer capacidadTotal;
}
