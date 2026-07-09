package com.alphapark.dto.tickets;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class HistorialResponse {
    private KpisHistorial kpis;
    private List<RegistroHistorialItem> registros;
}
