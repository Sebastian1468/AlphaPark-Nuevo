package com.alphapark.dto.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PuntoHoraPicoResponse {
    private int hora;
    private String etiqueta;
    private long cantidad;
}
