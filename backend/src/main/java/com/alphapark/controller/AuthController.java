package com.alphapark.controller;

import com.alphapark.dto.auth.LoginRequest;
import com.alphapark.dto.auth.RegistroRequest;
import com.alphapark.dto.auth.UsuarioResponse;
import com.alphapark.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Expone los endpoints REST de autenticacion (registro y login). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registro(@RequestBody RegistroRequest request) {
        UsuarioResponse respuesta = authService.registrar(request.getNombreUsuario(), request.getPassword(), request.getRol());
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@RequestBody LoginRequest request) {
        UsuarioResponse respuesta = authService.login(request.getNombreUsuario(), request.getPassword());
        return ResponseEntity.ok(respuesta);
    }
}
