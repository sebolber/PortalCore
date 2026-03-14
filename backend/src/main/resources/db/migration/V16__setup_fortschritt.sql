-- Setup-Fortschritt pro Schritt tracken
ALTER TABLE system_initialisierung
    ADD COLUMN IF NOT EXISTS setup_smtp_abgeschlossen BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS setup_mandant_abgeschlossen BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS setup_superuser_abgeschlossen BOOLEAN NOT NULL DEFAULT FALSE;
