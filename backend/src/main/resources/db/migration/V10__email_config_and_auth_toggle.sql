-- V10: E-Mail-Konfiguration (SMTP/IMAP/POP3) und Auth-Toggle in PortalParameter
-- Alle E-Mail-Einstellungen werden in portal_parameters gespeichert
-- damit sie ueber die UI konfiguriert und exportiert/importiert werden koennen.

-- =====================================================
-- 1. SMTP-Konfiguration (erweitert par-21..par-23)
-- =====================================================
INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, last_modified, last_modified_by, created_at)
VALUES
('par-mail-smtp-user', 'portal.email.smtp.username', 'SMTP-Benutzername', 'Benutzername fuer die SMTP-Authentifizierung', 'portal', 'Portal', 'Email', 'STRING', '', '', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-smtp-pass', 'portal.email.smtp.password', 'SMTP-Passwort', 'Passwort fuer die SMTP-Authentifizierung', 'portal', 'Portal', 'Email', 'PASSWORD', '', '', false, NULL, NULL, NULL, true, false, NOW(), 'system', NOW()),
('par-mail-smtp-auth', 'portal.email.smtp.auth', 'SMTP-Authentifizierung', 'SMTP-Authentifizierung aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'false', 'false', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-mail-smtp-starttls', 'portal.email.smtp.starttls', 'SMTP STARTTLS', 'STARTTLS-Verschluesselung aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'false', 'false', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-mail-smtp-ssl', 'portal.email.smtp.ssl', 'SMTP SSL/TLS', 'SSL/TLS-Verschluesselung aktivieren (Port 465)', 'portal', 'Portal', 'Email', 'BOOLEAN', 'false', 'false', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW());

-- =====================================================
-- 2. IMAP-Konfiguration (Posteingang)
-- =====================================================
INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, last_modified, last_modified_by, created_at)
VALUES
('par-mail-imap-host', 'portal.email.imap.host', 'IMAP-Server', 'Hostname des IMAP-Servers', 'portal', 'Portal', 'Email', 'STRING', '', '', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-imap-port', 'portal.email.imap.port', 'IMAP-Port', 'Port des IMAP-Servers', 'portal', 'Portal', 'Email', 'NUMBER', '993', '993', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-imap-user', 'portal.email.imap.username', 'IMAP-Benutzername', 'Benutzername fuer die IMAP-Anmeldung', 'portal', 'Portal', 'Email', 'STRING', '', '', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-imap-pass', 'portal.email.imap.password', 'IMAP-Passwort', 'Passwort fuer die IMAP-Anmeldung', 'portal', 'Portal', 'Email', 'PASSWORD', '', '', false, NULL, NULL, NULL, true, false, NOW(), 'system', NOW()),
('par-mail-imap-ssl', 'portal.email.imap.ssl', 'IMAP SSL/TLS', 'SSL/TLS-Verschluesselung fuer IMAP aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'true', 'true', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-mail-imap-enabled', 'portal.email.imap.enabled', 'IMAP aktiviert', 'IMAP-Posteingang aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'false', 'false', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW());

-- =====================================================
-- 3. POP3-Konfiguration (Posteingang)
-- =====================================================
INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, last_modified, last_modified_by, created_at)
VALUES
('par-mail-pop3-host', 'portal.email.pop3.host', 'POP3-Server', 'Hostname des POP3-Servers', 'portal', 'Portal', 'Email', 'STRING', '', '', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-pop3-port', 'portal.email.pop3.port', 'POP3-Port', 'Port des POP3-Servers', 'portal', 'Portal', 'Email', 'NUMBER', '995', '995', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-pop3-user', 'portal.email.pop3.username', 'POP3-Benutzername', 'Benutzername fuer die POP3-Anmeldung', 'portal', 'Portal', 'Email', 'STRING', '', '', false, NULL, NULL, NULL, false, false, NOW(), 'system', NOW()),
('par-mail-pop3-pass', 'portal.email.pop3.password', 'POP3-Passwort', 'Passwort fuer die POP3-Anmeldung', 'portal', 'Portal', 'Email', 'PASSWORD', '', '', false, NULL, NULL, NULL, true, false, NOW(), 'system', NOW()),
('par-mail-pop3-ssl', 'portal.email.pop3.ssl', 'POP3 SSL/TLS', 'SSL/TLS-Verschluesselung fuer POP3 aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'true', 'true', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-mail-pop3-enabled', 'portal.email.pop3.enabled', 'POP3 aktiviert', 'POP3-Posteingang aktivieren', 'portal', 'Portal', 'Email', 'BOOLEAN', 'false', 'false', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW());

-- =====================================================
-- 4. E-Mail-Authentifizierung Toggle (OTP per E-Mail)
-- =====================================================
INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, last_modified, last_modified_by, created_at)
VALUES
('par-auth-email-enabled', 'portal.auth.email.enabled', 'E-Mail-Authentifizierung', 'Benutzer-Authentifizierung per E-Mail-OTP aktivieren/deaktivieren', 'portal', 'Portal', 'Sicherheit', 'BOOLEAN', 'true', 'true', false, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-auth-otp-length', 'portal.auth.otp.length', 'OTP-Code Laenge', 'Anzahl der Stellen des Einmal-Codes', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '6', '6', true, NULL, NULL, 'Stellen', false, true, NOW(), 'system', NOW()),
('par-auth-otp-expiry', 'portal.auth.otp.expiration-minutes', 'OTP Gueltigkeit', 'Gueltigkeitsdauer des Einmal-Codes', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '10', '10', true, NULL, NULL, 'Minuten', false, true, NOW(), 'system', NOW()),
('par-auth-otp-attempts', 'portal.auth.otp.max-attempts', 'Max. OTP-Versuche', 'Maximale Anzahl Versuche fuer den Einmal-Code', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '5', '5', true, NULL, NULL, NULL, false, true, NOW(), 'system', NOW()),
('par-auth-otp-rate', 'portal.auth.otp.rate-limit', 'OTP Rate-Limit', 'Maximale OTP-Anfragen pro Stunde', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '5', '5', true, NULL, NULL, 'pro Stunde', false, true, NOW(), 'system', NOW());

-- =====================================================
-- 5. PortalParameter: admin_only Feld
--    Parameter die nur von Administratoren geaendert werden duerfen
-- =====================================================
ALTER TABLE portal_parameters ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false;

-- E-Mail-Konfigurationsparameter nur fuer Admins
UPDATE portal_parameters SET admin_only = true WHERE param_key LIKE 'portal.email.%';
UPDATE portal_parameters SET admin_only = true WHERE param_key LIKE 'portal.auth.%';
UPDATE portal_parameters SET admin_only = true WHERE param_key IN ('portal.session.timeout', 'portal.2fa.enabled', 'portal.password.min.length', 'portal.audit.retention', 'portal.gdpr.anonymize.after');
