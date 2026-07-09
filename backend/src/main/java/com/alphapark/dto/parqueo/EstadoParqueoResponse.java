package com.alphapark.dto.parqueo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Respuesta de GET /api/parqueo/estado.
 * Nota: "estaLleno" se mantiene en camelCase (no snake_case) porque
 * asi lo espera la interfaz EstadoParqueo del frontend en Angular.
 */
@Getter
@Setter
@AllArgsConstructor
public class EstadoParqueoResponse {
    private Integer capacidadTotal;
    private Integer espaciosOcupados;
    private Integer disponibles;

    @JsonProperty("estaLleno")
    private boolean estaLleno;

    private BigDecimal tarifaPorHora;
}
