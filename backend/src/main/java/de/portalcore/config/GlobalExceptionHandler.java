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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private static final Pattern REFERENCED_TABLE_PATTERN =
            Pattern.compile("is still referenced from table \"(\\w+)\"");

    private static final Map<String, String> TABLE_LABELS = Map.ofEntries(
            Map.entry("portal_users", "Benutzer"),
            Map.entry("dashboard_widgets", "Dashboard-Widgets"),
            Map.entry("nachricht_items", "Nachrichten"),
            Map.entry("nachricht_empfaenger", "Nachrichten-Empfaenger"),
            Map.entry("nachricht_anhaenge", "Nachrichten-Anhaenge"),
            Map.entry("user_roles", "Rollenzuordnungen"),
            Map.entry("user_gruppen", "Gruppenzuordnungen"),
            Map.entry("user_stellvertreter", "Stellvertretungen"),
            Map.entry("user_adressen", "Adressen"),
            Map.entry("installed_apps", "installierte Apps"),
            Map.entry("sessions", "aktive Sitzungen")
    );

    private String resolveIntegrityViolationMessage(String dbMessage) {
        if (dbMessage == null || !dbMessage.contains("foreign key")) {
            return "Datenintegritaetsfehler: Die Aenderung verletzt eine Integritaetsbedingung.";
        }

        Matcher matcher = REFERENCED_TABLE_PATTERN.matcher(dbMessage);
        if (matcher.find()) {
            String referencingTable = matcher.group(1);
            String label = TABLE_LABELS.getOrDefault(referencingTable, referencingTable);
            return "Loeschen nicht moeglich: Es existieren noch zugeordnete " + label + ".";
        }

        return "Loeschen nicht moeglich: Es existieren noch abhaengige Datensaetze.";
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
