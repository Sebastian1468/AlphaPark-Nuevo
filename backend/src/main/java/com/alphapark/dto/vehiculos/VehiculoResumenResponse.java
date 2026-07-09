package com.alphapark.dto.vehiculos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class VehiculoResumenResponse {
    private String placa;
    private String tipo;
    private long visitas;
    private BigDecimal totalGastado;
    private LocalDate ultimaVisita;
    private boolean estaActivo;
}
