package de.portalcore.config;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Entity nicht gefunden: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String dbMessage = ex.getMostSpecificCause().getMessage();
        log.warn("Datenintegritaetsfehler: {}", dbMessage);

        String message = resolveIntegrityViolationMessage(dbMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", message, "message", message));
    }

    private String resolveIntegrityViolationMessage(String dbMessage) {
        if (dbMessage != null && dbMessage.contains("foreign key")) {
            if (dbMessage.contains("portal_users")) {
                return "Loeschen nicht moeglich: Es sind noch Benutzer zugeordnet.";
            }
            return "Loeschen nicht moeglich: Es existieren noch abhaengige Datensaetze.";
        }
        return "Datenintegritaetsfehler: Die Aenderung verletzt eine Integritaetsbedingung.";
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Ungueltiges Argument: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unerwarteter Fehler: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Interner Serverfehler"));
    }
}
