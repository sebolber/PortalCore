-- V7: Super-User, Parameter-Gueltigkeit und Parameter-Audit-Log

-- =====================================================
-- 1. SUPER-USER: Sebastian Olberding
-- =====================================================
INSERT INTO portal_users (id, vorname, nachname, email, iam_id, tenant_id, status, erstellt_am, iam_sync, initialen, super_admin)
VALUES ('u-super', 'Sebastian', 'Olberding', 'portal@olberding.net', 'IAM-SUPER', 't-aok-nw', 'AKTIV', NOW(), false, 'SO', true);

-- Super-User der Admin-Gruppe zuordnen
INSERT INTO user_gruppen (user_id, gruppe_id, zugeordnet_von) VALUES ('u-super', 'g-admin', 'system');

-- Super-User dem Mandanten zuordnen
INSERT INTO user_tenants (user_id, tenant_id, ist_standard, aktiv, zugeordnet_von) VALUES ('u-super', 't-aok-nw', true, true, 'system');

-- Optional: Auch den anderen Mandanten zuordnen (Super-Admin = mandantenuebergreifend)
INSERT INTO user_tenants (user_id, tenant_id, ist_standard, aktiv, zugeordnet_von) VALUES ('u-super', 't-aok-by', false, true, 'system');
INSERT INTO user_tenants (user_id, tenant_id, ist_standard, aktiv, zugeordnet_von) VALUES ('u-super', 't-tk', false, true, 'system');

-- =====================================================
-- 2. PARAMETER-GUELTIGKEIT (zeitlich von/bis)
-- =====================================================
ALTER TABLE portal_parameters ADD COLUMN gueltig_von TIMESTAMP DEFAULT '1970-01-01 00:00:00';
ALTER TABLE portal_parameters ADD COLUMN gueltig_bis TIMESTAMP DEFAULT '9999-12-31 23:59:59';

-- Bestehende Parameter: immer gueltig (Standard)
UPDATE portal_parameters SET gueltig_von = '1970-01-01 00:00:00', gueltig_bis = '9999-12-31 23:59:59' WHERE gueltig_von IS NULL;

-- =====================================================
-- 3. PARAMETER-AUDIT-LOG (Aenderungsprotokoll)
-- =====================================================
CREATE TABLE parameter_audit_log (
    id VARCHAR(50) PRIMARY KEY,
    parameter_id VARCHAR(50) NOT NULL,
    param_key VARCHAR(150) NOT NULL,
    app_id VARCHAR(50),
    app_name VARCHAR(100),
    alter_wert TEXT,
    neuer_wert TEXT,
    geaendert_von VARCHAR(100) NOT NULL,
    geaendert_am TIMESTAMP NOT NULL DEFAULT NOW(),
    grund TEXT
);

CREATE INDEX idx_parameter_audit_log_param ON parameter_audit_log(parameter_id);
CREATE INDEX idx_parameter_audit_log_app ON parameter_audit_log(app_id);
CREATE INDEX idx_parameter_audit_log_zeit ON parameter_audit_log(geaendert_am);

-- =====================================================
-- 4. Bestehende Parameter mit Gueltigkeit aktualisieren
-- =====================================================
-- Alle Parameter standardmaessig immer gueltig
