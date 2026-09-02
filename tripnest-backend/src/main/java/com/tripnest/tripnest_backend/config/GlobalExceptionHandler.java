package com.tripnest.tripnest_backend.config;

import com.tripnest.tripnest_backend.dto.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(errorMessage));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleRuntimeException(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";
        HttpStatus status = msg.toLowerCase().contains("access denied")
                ? HttpStatus.FORBIDDEN
                : msg.toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(new MessageResponse(msg));
    }
}
