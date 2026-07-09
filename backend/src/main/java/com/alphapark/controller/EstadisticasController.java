package com.alphapark.controller;

import com.alphapark.dto.estadisticas.PuntoGananciaResponse;
import com.alphapark.dto.estadisticas.PuntoHoraPicoResponse;
import com.alphapark.dto.estadisticas.ResumenResponse;
import com.alphapark.service.EstadisticasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Expone los graficos y KPIs que alimentan el Dashboard Gerencial. */
@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<ResumenResponse> resumen() {
        return ResponseEntity.ok(estadisticasService.getResumen());
    }

    @GetMapping("/ganancias")
    public ResponseEntity<List<PuntoGananciaResponse>> ganancias(
            @RequestParam(name = "periodo", defaultValue = "dia") String periodo) {
        return ResponseEntity.ok(estadisticasService.getGanancias(periodo));
    }

    @GetMapping("/hora-pico")
    public ResponseEntity<List<PuntoHoraPicoResponse>> horaPico() {
        return ResponseEntity.ok(estadisticasService.getHoraPico());
    }
}
