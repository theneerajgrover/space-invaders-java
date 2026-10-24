package com.spaceinvaders.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized error handler for REST controllers.
 * Catches validation errors and unexpected exceptions,
 * returning clean JSON responses without exposing stack traces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle bean validation errors (e.g. @NotBlank, @Min, @Max).
     * Returns 400 Bad Request with field-level error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("timestamp", LocalDateTime.now().toString());

        // Collect the first validation error message
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Invalid request data");

        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle any other unexpected exceptions.
     * Returns 500 Internal Server Error without leaking details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "An internal error occurred. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
