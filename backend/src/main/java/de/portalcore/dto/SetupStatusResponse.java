package de.portalcore.dto;

public record SetupStatusResponse(
        boolean istInitialisiert,
        boolean smtpKonfiguriert,
        boolean mandantAngelegt,
        boolean superuserAngelegt
) {}
