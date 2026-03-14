-- Tabelle fuer Systeminitialisierungsstatus
CREATE TABLE IF NOT EXISTS system_initialisierung (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'SYSTEM',
    ist_initialisiert BOOLEAN NOT NULL DEFAULT FALSE,
    initialisiert_am TIMESTAMP,
    initialisiert_von VARCHAR(255)
);

-- Tabelle fuer SMTP-Konfiguration
CREATE TABLE IF NOT EXISTS smtp_konfiguration (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'DEFAULT',
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    benutzername VARCHAR(255),
    passwort_verschluesselt VARCHAR(1024),
    verschluesselung VARCHAR(20) NOT NULL DEFAULT 'TLS',
    absender_name VARCHAR(255) NOT NULL,
    absender_email VARCHAR(255) NOT NULL,
    authentifizierung_aktiv BOOLEAN NOT NULL DEFAULT TRUE,
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW(),
    aktualisiert_am TIMESTAMP
);

-- Initialen Datensatz fuer Systemstatus einfuegen
INSERT INTO system_initialisierung (id, ist_initialisiert)
VALUES ('SYSTEM', FALSE)
ON CONFLICT (id) DO NOTHING;
