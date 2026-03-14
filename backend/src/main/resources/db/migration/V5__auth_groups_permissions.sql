-- V5: Benutzer-Rollen-Rechte-System mit OTP-Authentifizierung
-- Erweitert das Portal um feingranulare Gruppenberechtigungen, Multi-Mandantenfaehigkeit,
-- OTP-basierte Anmeldung und erweiterte Benutzer-/Mandantenverwaltung.

-- =====================================================
-- 1. MANDANTEN erweitern (Adresse, Kontakt)
-- =====================================================
ALTER TABLE tenants ADD COLUMN strasse VARCHAR(255);
ALTER TABLE tenants ADD COLUMN hausnummer VARCHAR(20);
ALTER TABLE tenants ADD COLUMN plz VARCHAR(10);
ALTER TABLE tenants ADD COLUMN ort VARCHAR(100);
ALTER TABLE tenants ADD COLUMN land VARCHAR(100) DEFAULT 'Deutschland';
ALTER TABLE tenants ADD COLUMN telefon VARCHAR(50);
ALTER TABLE tenants ADD COLUMN email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN webseite VARCHAR(255);
ALTER TABLE tenants ADD COLUMN ansprechpartner VARCHAR(200);
ALTER TABLE tenants ADD COLUMN aktiv BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN updated_at TIMESTAMP;

-- =====================================================
-- 2. BENUTZER erweitern (Personendaten, kein Passwort)
-- =====================================================
ALTER TABLE portal_users ADD COLUMN titel VARCHAR(50);
ALTER TABLE portal_users ADD COLUMN telefon VARCHAR(50);
ALTER TABLE portal_users ADD COLUMN mobil VARCHAR(50);
ALTER TABLE portal_users ADD COLUMN abteilung VARCHAR(200);
ALTER TABLE portal_users ADD COLUMN position_titel VARCHAR(200);
ALTER TABLE portal_users ADD COLUMN geburtsdatum DATE;
ALTER TABLE portal_users ADD COLUMN anrede VARCHAR(20);
ALTER TABLE portal_users DROP COLUMN IF EXISTS password_hash;

-- =====================================================
-- 3. BENUTZER-MANDANTEN (Many-to-Many)
-- =====================================================
CREATE TABLE user_tenants (
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ist_standard BOOLEAN DEFAULT false,
    aktiv BOOLEAN DEFAULT true,
    zugeordnet_am TIMESTAMP DEFAULT NOW(),
    zugeordnet_von VARCHAR(100),
    PRIMARY KEY (user_id, tenant_id)
);

-- Bestehende Zuordnungen migrieren
INSERT INTO user_tenants (user_id, tenant_id, ist_standard, aktiv)
SELECT id, tenant_id, true, true FROM portal_users WHERE tenant_id IS NOT NULL;

CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);

-- =====================================================
-- 4. BENUTZER-ADRESSEN (mehrere pro Benutzer)
-- =====================================================
CREATE TABLE user_adressen (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    typ VARCHAR(50) NOT NULL DEFAULT 'PRIVAT',
    bezeichnung VARCHAR(200),
    strasse VARCHAR(255),
    hausnummer VARCHAR(20),
    plz VARCHAR(10),
    ort VARCHAR(100),
    land VARCHAR(100) DEFAULT 'Deutschland',
    zusatz VARCHAR(255),
    ist_hauptadresse BOOLEAN DEFAULT false,
    erstellt_am TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_adressen_user ON user_adressen(user_id);

-- =====================================================
-- 5. GRUPPEN (Berechtigungsgruppen)
-- =====================================================
CREATE TABLE gruppen (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    system_gruppe BOOLEAN DEFAULT false,
    farbe VARCHAR(20),
    erstellt_am TIMESTAMP DEFAULT NOW(),
    erstellt_von VARCHAR(100),
    updated_at TIMESTAMP
);

CREATE INDEX idx_gruppen_tenant ON gruppen(tenant_id);

-- =====================================================
-- 6. GRUPPEN-BERECHTIGUNGEN (pro Use Case)
-- =====================================================
CREATE TABLE gruppen_berechtigungen (
    id VARCHAR(50) PRIMARY KEY,
    gruppe_id VARCHAR(50) NOT NULL REFERENCES gruppen(id) ON DELETE CASCADE,
    use_case VARCHAR(200) NOT NULL,
    use_case_label VARCHAR(300) NOT NULL,
    anzeigen BOOLEAN DEFAULT false,
    lesen BOOLEAN DEFAULT false,
    schreiben BOOLEAN DEFAULT false,
    loeschen BOOLEAN DEFAULT false,
    app_id VARCHAR(50),
    UNIQUE(gruppe_id, use_case)
);

CREATE INDEX idx_gruppen_berechtigungen_gruppe ON gruppen_berechtigungen(gruppe_id);
CREATE INDEX idx_gruppen_berechtigungen_usecase ON gruppen_berechtigungen(use_case);

-- =====================================================
-- 7. BENUTZER-GRUPPEN (Zuordnung)
-- =====================================================
CREATE TABLE user_gruppen (
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    gruppe_id VARCHAR(50) NOT NULL REFERENCES gruppen(id) ON DELETE CASCADE,
    zugeordnet_am TIMESTAMP DEFAULT NOW(),
    zugeordnet_von VARCHAR(100),
    PRIMARY KEY (user_id, gruppe_id)
);

CREATE INDEX idx_user_gruppen_user ON user_gruppen(user_id);
CREATE INDEX idx_user_gruppen_gruppe ON user_gruppen(gruppe_id);

-- =====================================================
-- 8. OTP-CODES (Einmalpasswoerter)
-- =====================================================
CREATE TABLE otp_codes (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW(),
    gueltig_bis TIMESTAMP NOT NULL,
    verwendet BOOLEAN DEFAULT false,
    ip_adresse VARCHAR(50),
    versuche INT DEFAULT 0
);

CREATE INDEX idx_otp_codes_email ON otp_codes(email);
CREATE INDEX idx_otp_codes_gueltig ON otp_codes(gueltig_bis);

-- =====================================================
-- 9. AUTH-SESSIONS (JWT-basiert)
-- =====================================================
CREATE TABLE auth_sessions (
    id VARCHAR(200) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    erstellt_am TIMESTAMP DEFAULT NOW(),
    gueltig_bis TIMESTAMP NOT NULL,
    ip_adresse VARCHAR(50),
    user_agent TEXT,
    aktiv BOOLEAN DEFAULT true
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_gueltig ON auth_sessions(gueltig_bis);

-- =====================================================
-- 10. AUDIT-LOG (Sicherheitsrelevante Aktionen)
-- =====================================================
CREATE TABLE audit_log (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    tenant_id VARCHAR(50),
    aktion VARCHAR(100) NOT NULL,
    details TEXT,
    ip_adresse VARCHAR(50),
    user_agent TEXT,
    zeitstempel TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_zeit ON audit_log(zeitstempel);

-- =====================================================
-- 11. VORKONFIGURIERTE GRUPPEN (Systemgruppen)
-- =====================================================

-- Administration (alle Rechte)
INSERT INTO gruppen (id, name, beschreibung, system_gruppe, farbe, erstellt_von)
VALUES ('g-admin', 'Administration', 'Vollzugriff auf alle Funktionen des Portals. Darf lesen, schreiben und loeschen.', true, '#CC3333', 'system');

-- Lesender Zugriff (nur lesen)
INSERT INTO gruppen (id, name, beschreibung, system_gruppe, farbe, erstellt_von)
VALUES ('g-leser', 'Lesender Zugriff', 'Nur-Lese-Zugriff auf alle sichtbaren Bereiche. Kein Schreiben oder Loeschen moeglich.', true, '#887D75', 'system');

-- Sachbearbeiter
INSERT INTO gruppen (id, name, beschreibung, system_gruppe, farbe, erstellt_von)
VALUES ('g-sachbearbeiter', 'Sachbearbeiter', 'Bearbeitung von Faellen, Aufgaben und fachlichen Anwendungsfaellen.', true, '#28A745', 'system');

-- Use Cases fuer Administration (alle Rechte)
INSERT INTO gruppen_berechtigungen (id, gruppe_id, use_case, use_case_label, anzeigen, lesen, schreiben, loeschen, app_id) VALUES
('gb-a-01', 'g-admin', 'dashboard',        'Dashboard',                  true, true, true, true, 'portal'),
('gb-a-02', 'g-admin', 'appstore',         'App Store',                  true, true, true, true, 'portal'),
('gb-a-03', 'g-admin', 'nachrichten',      'Nachrichten',                true, true, true, true, 'portal'),
('gb-a-04', 'g-admin', 'benutzer',         'Benutzerverwaltung',         true, true, true, true, 'portal'),
('gb-a-05', 'g-admin', 'gruppen',          'Gruppenverwaltung',          true, true, true, true, 'portal'),
('gb-a-06', 'g-admin', 'mandanten',        'Mandantenverwaltung',        true, true, true, true, 'portal'),
('gb-a-07', 'g-admin', 'parameter',        'Parameterverwaltung',        true, true, true, true, 'portal'),
('gb-a-08', 'g-admin', 'batch',            'Batch-Jobs',                 true, true, true, true, 'portal'),
('gb-a-09', 'g-admin', 'cms',              'CMS',                        true, true, true, true, 'portal'),
('gb-a-10', 'g-admin', 'formulare',        'Formulare',                  true, true, true, true, 'portal'),
('gb-a-11', 'g-admin', 'ki-agenten',       'KI-Agenten',                 true, true, true, true, 'portal'),
('gb-a-12', 'g-admin', 'aufgaben',         'Aufgabensteuerung',          true, true, true, true, 'portal'),
('gb-a-13', 'g-admin', 'einstellungen',    'Einstellungen',              true, true, true, true, 'portal'),
('gb-a-14', 'g-admin', 'admin',            'Administration',             true, true, true, true, 'portal'),
('gb-a-15', 'g-admin', 'audit',            'Audit-Log',                  true, true, true, true, 'portal');

-- Use Cases fuer Lesender Zugriff (nur anzeigen + lesen)
INSERT INTO gruppen_berechtigungen (id, gruppe_id, use_case, use_case_label, anzeigen, lesen, schreiben, loeschen, app_id) VALUES
('gb-l-01', 'g-leser', 'dashboard',        'Dashboard',                  true, true, false, false, 'portal'),
('gb-l-02', 'g-leser', 'appstore',         'App Store',                  true, true, false, false, 'portal'),
('gb-l-03', 'g-leser', 'nachrichten',      'Nachrichten',                true, true, false, false, 'portal'),
('gb-l-04', 'g-leser', 'benutzer',         'Benutzerverwaltung',         true, true, false, false, 'portal'),
('gb-l-05', 'g-leser', 'parameter',        'Parameterverwaltung',        true, true, false, false, 'portal'),
('gb-l-06', 'g-leser', 'batch',            'Batch-Jobs',                 true, true, false, false, 'portal'),
('gb-l-07', 'g-leser', 'einstellungen',    'Einstellungen',              true, true, false, false, 'portal');

-- Use Cases fuer Sachbearbeiter
INSERT INTO gruppen_berechtigungen (id, gruppe_id, use_case, use_case_label, anzeigen, lesen, schreiben, loeschen, app_id) VALUES
('gb-s-01', 'g-sachbearbeiter', 'dashboard',     'Dashboard',           true, true, false, false, 'portal'),
('gb-s-02', 'g-sachbearbeiter', 'appstore',      'App Store',           true, true, false, false, 'portal'),
('gb-s-03', 'g-sachbearbeiter', 'nachrichten',   'Nachrichten',         true, true, true, false, 'portal'),
('gb-s-04', 'g-sachbearbeiter', 'aufgaben',      'Aufgabensteuerung',   true, true, true, false, 'portal'),
('gb-s-05', 'g-sachbearbeiter', 'einstellungen', 'Einstellungen',       true, true, true, false, 'portal');
