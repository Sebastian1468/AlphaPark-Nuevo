package com.alphapark.exception;

import org.springframework.http.HttpStatus;

/**
 * Excepcion base para errores de negocio esperados (validaciones,
 * recursos no encontrados, conflictos, credenciales invalidas, etc).
 * El GlobalExceptionHandler la traduce a { "message": "..." } con el
 * codigo HTTP indicado, igual que hacia el backend anterior en Node.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }
}
