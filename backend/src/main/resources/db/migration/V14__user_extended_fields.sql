-- V14: Erweiterte Benutzerattribute fuer Benutzerverwaltung

ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS fehlgeschlagene_logins INTEGER DEFAULT 0;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS letzte_login_ip VARCHAR(50);
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS sprache VARCHAR(10) DEFAULT 'de';
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS zeitzone VARCHAR(50) DEFAULT 'Europe/Berlin';
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS standard_dashboard VARCHAR(200);
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS email_benachrichtigungen BOOLEAN DEFAULT TRUE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS push_benachrichtigungen BOOLEAN DEFAULT FALSE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS sms_benachrichtigungen BOOLEAN DEFAULT FALSE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS newsletter_einwilligung BOOLEAN DEFAULT FALSE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS letzte_aenderung_am TIMESTAMP;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS erstellt_von VARCHAR(200);
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS zuletzt_geaendert_von VARCHAR(200);
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS audit_trail_id VARCHAR(100);
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS delegationsrechte BOOLEAN DEFAULT FALSE;

-- Stellvertreter-Tabelle (Many-to-Many Self-Referencing)
CREATE TABLE IF NOT EXISTS user_stellvertreter (
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    stellvertreter_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, stellvertreter_id),
    CHECK (user_id != stellvertreter_id)
);
