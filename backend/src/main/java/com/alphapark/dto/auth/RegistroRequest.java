package com.alphapark.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroRequest {
    private String nombreUsuario;
    private String password;
    private String rol;
}
