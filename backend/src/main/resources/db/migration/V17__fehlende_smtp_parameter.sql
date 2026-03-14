-- Fehlende SMTP-Basis-Parameter die fuer den OTP-Mailversand benoetigt werden.
-- V10 hat nur die erweiterten Parameter (auth, starttls, ssl, username, password) angelegt,
-- aber host, port und from-Adresse fehlten.

INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, admin_only, last_modified, last_modified_by, created_at)
VALUES
('par-mail-smtp-host', 'portal.email.smtp.host', 'SMTP-Server', 'Hostname des SMTP-Servers', 'portal', 'Portal', 'Email', 'STRING', '', '', true, NULL, NULL, NULL, false, false, true, NOW(), 'system', NOW()),
('par-mail-smtp-port', 'portal.email.smtp.port', 'SMTP-Port', 'Port des SMTP-Servers (587=STARTTLS, 465=SSL)', 'portal', 'Portal', 'Email', 'NUMBER', '587', '587', true, NULL, NULL, NULL, false, false, true, NOW(), 'system', NOW()),
('par-mail-from', 'portal.email.from', 'Absender-E-Mail', 'E-Mail-Adresse die als Absender verwendet wird', 'portal', 'Portal', 'Email', 'STRING', '', '', true, NULL, NULL, NULL, false, false, true, NOW(), 'system', NOW())
ON CONFLICT (id) DO NOTHING;
