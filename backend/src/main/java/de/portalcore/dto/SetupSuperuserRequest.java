package de.portalcore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetupSuperuserRequest(
        @NotBlank(message = "Vorname ist erforderlich")
        String vorname,

        @NotBlank(message = "Nachname ist erforderlich")
        String nachname,

        @NotBlank(message = "E-Mail ist erforderlich")
        @Email(message = "E-Mail-Adresse muss gueltig sein")
        String email,

        @NotBlank(message = "Passwort ist erforderlich")
        @Size(min = 8, message = "Passwort muss mindestens 8 Zeichen lang sein")
        String passwort,

        @NotBlank(message = "Passwort-Bestaetigung ist erforderlich")
        String passwortBestaetigung,

        String sprache,
        String zeitzone
) {}
