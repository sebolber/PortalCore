-- V6: App-uebergreifende Berechtigungen und Super-Admin
-- Ermoeglicht installierten Apps, ihre Use Cases dem Portal mitzuteilen,
-- sodass Berechtigungen zentral konfiguriert werden koennen.

-- =====================================================
-- 1. SUPER-ADMIN Flag (mandantenuebergreifend)
-- =====================================================
ALTER TABLE portal_users ADD COLUMN super_admin BOOLEAN DEFAULT false;

-- Bestehende Admins (u-1) als Super-Admin setzen
UPDATE portal_users SET super_admin = true WHERE id = 'u-1';

-- =====================================================
-- 2. APP-USE-CASES (von Apps registrierte Use Cases)
-- =====================================================
CREATE TABLE app_use_cases (
    id VARCHAR(50) PRIMARY KEY,
    app_id VARCHAR(50) NOT NULL REFERENCES portal_apps(id) ON DELETE CASCADE,
    use_case VARCHAR(200) NOT NULL,
    use_case_label VARCHAR(300) NOT NULL,
    beschreibung TEXT,
    erstellt_am TIMESTAMP DEFAULT NOW(),
    UNIQUE(app_id, use_case)
);

CREATE INDEX idx_app_use_cases_app ON app_use_cases(app_id);
CREATE INDEX idx_app_use_cases_usecase ON app_use_cases(use_case);

-- =====================================================
-- 3. App-Installation Use Cases: Beim Installieren
--    werden die Use Cases der App automatisch in
--    gruppen_berechtigungen der Admin-Gruppe eingetragen.
-- =====================================================
-- Der Index auf app_id in gruppen_berechtigungen
-- verbessert die Performance beim Deinstallieren.
CREATE INDEX idx_gruppen_berechtigungen_app ON gruppen_berechtigungen(app_id);

-- =====================================================
-- 4. Appstore-Berechtigungen differenzieren:
--    appstore = browsen/anschauen (alle)
--    appstore-admin = installieren/deinstallieren (nur Admin)
-- =====================================================
INSERT INTO gruppen_berechtigungen (id, gruppe_id, use_case, use_case_label, anzeigen, lesen, schreiben, loeschen, app_id) VALUES
('gb-a-16', 'g-admin', 'appstore-admin', 'App-Installation', true, true, true, true, 'portal');

-- Sachbearbeiter und Leser: nur appstore browsen (schreiben=false bleibt)
-- Diese haben bereits appstore-Leseberechtigung, brauchen kein appstore-admin
