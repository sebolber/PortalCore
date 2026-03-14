package de.portalcore.dto;

import jakarta.validation.constraints.NotBlank;

public record SetupMandantRequest(
        @NotBlank(message = "Mandantenname ist erforderlich")
        String name,

        @NotBlank(message = "Kuerzel ist erforderlich")
        String kuerzel,

        String strasse,
        String hausnummer,
        String plz,
        String ort,
        String telefon,
        String email
) {}
