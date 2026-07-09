package com.alphapark.controller;

import com.alphapark.dto.parqueo.ActualizarConfigRequest;
import com.alphapark.dto.parqueo.ActualizarConfigResponse;
import com.alphapark.dto.parqueo.EstadoParqueoResponse;
import com.alphapark.dto.tickets.HistorialResponse;
import com.alphapark.dto.tickets.IngresoRequest;
import com.alphapark.dto.tickets.IngresoResponse;
import com.alphapark.dto.tickets.SalidaResponse;
import com.alphapark.dto.tickets.TicketActivoResponse;
import com.alphapark.service.AccesoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Punto de acceso al backend para las operaciones de estacionamiento:
 * recibe las solicitudes de registro de placas y las peticiones de
 * salida, delegando el control de negocio a AccesoService. Equivale a
 * la clase AccesoController del diagrama de clases tecnico del informe.
 */
@RestController
public class AccesoController {

    private final AccesoService accesoService;

    public AccesoController(AccesoService accesoService) {
        this.accesoService = accesoService;
    }

    // --- Aforo / configuracion ---

    @GetMapping("/api/parqueo/estado")
    public ResponseEntity<EstadoParqueoResponse> estado() {
        return ResponseEntity.ok(accesoService.consultarEstado());
    }

    @PutMapping("/api/parqueo/config")
    public ResponseEntity<ActualizarConfigResponse> actualizarConfig(@RequestBody ActualizarConfigRequest request) {
        return ResponseEntity.ok(accesoService.actualizarConfig(request.getTarifaPorHora(), request.getCapacidadTotal()));
    }

    // --- Tickets ---

    @PostMapping("/api/tickets/ingreso")
    public ResponseEntity<IngresoResponse> registrarIngreso(@RequestBody IngresoRequest request) {
        IngresoResponse respuesta = accesoService.registrarIngresoAutomatizado(
                request.getPlacaVehiculo(), request.getIdOperador());
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping("/api/tickets/activos")
    public ResponseEntity<List<TicketActivoResponse>> activos() {
        return ResponseEntity.ok(accesoService.listarActivos());
    }

    @PutMapping("/api/tickets/{id}/salida")
    public ResponseEntity<SalidaResponse> registrarSalida(@PathVariable("id") Integer idTicket) {
        return ResponseEntity.ok(accesoService.registrarSalidaAutomatizada(idTicket));
    }

    @GetMapping("/api/tickets/historial")
    public ResponseEntity<HistorialResponse> historial() {
        return ResponseEntity.ok(accesoService.obtenerHistorial());
    }
}
