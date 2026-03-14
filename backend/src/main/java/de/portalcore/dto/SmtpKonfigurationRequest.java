package de.portalcore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SmtpKonfigurationRequest(
        @NotBlank(message = "SMTP-Host ist erforderlich")
        String host,

        @NotNull(message = "SMTP-Port ist erforderlich")
        @Min(value = 1, message = "Port muss zwischen 1 und 65535 liegen")
        @Max(value = 65535, message = "Port muss zwischen 1 und 65535 liegen")
        Integer port,

        String benutzername,

        String passwort,

        @NotBlank(message = "Verschluesselung ist erforderlich")
        @Pattern(regexp = "NONE|TLS|SSL", message = "Verschluesselung muss NONE, TLS oder SSL sein")
        String verschluesselung,

        @NotBlank(message = "Absendername ist erforderlich")
        String absenderName,

        @NotBlank(message = "Absender-E-Mail ist erforderlich")
        @Email(message = "Absender-E-Mail muss gueltig sein")
        String absenderEmail,

        boolean authentifizierungAktiv
) {}
