package com.alphapark.controller;

import com.alphapark.dto.vehiculos.TicketVehiculoItem;
import com.alphapark.dto.vehiculos.VehiculoResumenResponse;
import com.alphapark.service.VehiculoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Buscador de vehiculos registrados y su historial de tickets por placa. */
@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResumenResponse>> buscar(
            @RequestParam(name = "buscar", defaultValue = "") String buscar) {
        return ResponseEntity.ok(vehiculoService.buscar(buscar));
    }

    @GetMapping("/{placa}/historial")
    public ResponseEntity<List<TicketVehiculoItem>> historialPorPlaca(@PathVariable String placa) {
        return ResponseEntity.ok(vehiculoService.getHistorialPorPlaca(placa));
    }
}
