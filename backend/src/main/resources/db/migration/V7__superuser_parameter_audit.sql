-- V7: Parameter-Gueltigkeit und Parameter-Audit-Log
-- Super-User wird ueber den Setup-Wizard angelegt, nicht mehr per Migration.

-- =====================================================
-- 1. PARAMETER-GUELTIGKEIT (zeitlich von/bis)
-- =====================================================
ALTER TABLE portal_parameters ADD COLUMN gueltig_von TIMESTAMP DEFAULT '1970-01-01 00:00:00';
ALTER TABLE portal_parameters ADD COLUMN gueltig_bis TIMESTAMP DEFAULT '9999-12-31 23:59:59';

-- Bestehende Parameter: immer gueltig (Standard)
UPDATE portal_parameters SET gueltig_von = '1970-01-01 00:00:00', gueltig_bis = '9999-12-31 23:59:59' WHERE gueltig_von IS NULL;

-- =====================================================
-- 2. PARAMETER-AUDIT-LOG (Aenderungsprotokoll)
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
