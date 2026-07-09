package com.alphapark.dto.auth;

import com.alphapark.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/** Respuesta de /api/auth/login y /api/auth/registro. */
@Getter
@Setter
@AllArgsConstructor
public class UsuarioResponse {
    private String message;
    private Integer idOperador;
    private String nombreUsuario;
    private Rol rol;
}
