-- =============================================================
-- V11: Nachrichtencenter - Unified Messages & Tasks
-- =============================================================

-- Unified table for messages (NACHRICHT) and tasks (AUFGABE)
CREATE TABLE nachricht_items (
    id VARCHAR(50) PRIMARY KEY,
    typ VARCHAR(20) NOT NULL DEFAULT 'NACHRICHT',          -- NACHRICHT, AUFGABE
    betreff VARCHAR(500) NOT NULL,
    inhalt TEXT,
    ersteller_id VARCHAR(50) NOT NULL REFERENCES portal_users(id),
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    prioritaet VARCHAR(20) NOT NULL DEFAULT 'NORMAL',      -- NIEDRIG, NORMAL, HOCH, DRINGEND
    status VARCHAR(20) NOT NULL DEFAULT 'OFFEN',           -- OFFEN, IN_BEARBEITUNG, ERLEDIGT, ABGEBROCHEN
    frist TIMESTAMP,                                        -- Deadline (mainly for tasks)
    erinnerung_am TIMESTAMP,                               -- Reminder timestamp
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW(),
    aktualisiert_am TIMESTAMP NOT NULL DEFAULT NOW(),
    system_generiert BOOLEAN NOT NULL DEFAULT FALSE,       -- Auto-created by system
    referenz_typ VARCHAR(50),                              -- Optional: source context (e.g. 'BATCH_JOB', 'APP', 'FALL')
    referenz_id VARCHAR(50)                                -- Optional: source entity ID
);

-- Recipients per message/task (each user gets their own read/archive state)
CREATE TABLE nachricht_empfaenger (
    id VARCHAR(50) PRIMARY KEY,
    nachricht_id VARCHAR(50) NOT NULL REFERENCES nachricht_items(id) ON DELETE CASCADE,
    empfaenger_id VARCHAR(50) NOT NULL REFERENCES portal_users(id),
    gelesen BOOLEAN NOT NULL DEFAULT FALSE,
    gelesen_am TIMESTAMP,
    archiviert BOOLEAN NOT NULL DEFAULT FALSE,
    archiviert_am TIMESTAMP,
    erledigt BOOLEAN NOT NULL DEFAULT FALSE,
    erledigt_am TIMESTAMP,
    UNIQUE(nachricht_id, empfaenger_id)
);

-- File attachments
CREATE TABLE nachricht_anhaenge (
    id VARCHAR(50) PRIMARY KEY,
    nachricht_id VARCHAR(50) NOT NULL REFERENCES nachricht_items(id) ON DELETE CASCADE,
    dateiname VARCHAR(500) NOT NULL,
    dateityp VARCHAR(100),
    dateigroesse BIGINT,
    daten BYTEA,
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nachricht_items_tenant ON nachricht_items(tenant_id);
CREATE INDEX idx_nachricht_items_ersteller ON nachricht_items(ersteller_id);
CREATE INDEX idx_nachricht_items_typ ON nachricht_items(typ);
CREATE INDEX idx_nachricht_items_status ON nachricht_items(status);
CREATE INDEX idx_nachricht_items_erstellt_am ON nachricht_items(erstellt_am DESC);
CREATE INDEX idx_nachricht_items_frist ON nachricht_items(frist) WHERE frist IS NOT NULL;
CREATE INDEX idx_nachricht_empfaenger_nachricht ON nachricht_empfaenger(nachricht_id);
CREATE INDEX idx_nachricht_empfaenger_empfaenger ON nachricht_empfaenger(empfaenger_id);
CREATE INDEX idx_nachricht_empfaenger_gelesen ON nachricht_empfaenger(empfaenger_id, gelesen) WHERE gelesen = FALSE;
CREATE INDEX idx_nachricht_empfaenger_archiviert ON nachricht_empfaenger(empfaenger_id, archiviert);
CREATE INDEX idx_nachricht_anhaenge_nachricht ON nachricht_anhaenge(nachricht_id);
