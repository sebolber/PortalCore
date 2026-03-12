-- adesso health Portal - Seed Data

-- Tenants
INSERT INTO tenants (id, name, short_name) VALUES
('t-aok-nw', 'AOK Nordwest', 'AOK NW'),
('t-aok-by', 'AOK Bayern', 'AOK BY'),
('t-tk', 'Techniker Krankenkasse', 'TK');

-- Roles
INSERT INTO portal_rollen (id, name, beschreibung, hierarchie, scope, benutzer_anzahl, system_rolle, farbe) VALUES
('r-admin', 'Administrator', 'Vollzugriff auf alle Portalfunktionen', 100, 'global', 2, true, '#CC3333'),
('r-manager', 'Manager', 'Verwaltung von Benutzern und Apps', 80, 'global', 3, true, '#006EC7'),
('r-sachbearbeiter', 'Sachbearbeiter', 'Bearbeitung von Faellen und Aufgaben', 60, 'global', 4, false, '#28A745'),
('r-leser', 'Leser', 'Nur-Lese-Zugriff', 20, 'global', 2, false, '#887D75'),
('r-kv-admin', 'KV-Administrator', 'Admin fuer KV-spezifische Apps', 90, 't-aok-nw', 1, false, '#461EBE'),
('r-abrechnung', 'Abrechnungsexperte', 'Zugriff auf Abrechnungs-Apps', 50, 'global', 3, false, '#FF9868'),
('r-it-support', 'IT-Support', 'Technischer Support und Batch-Jobs', 70, 'global', 2, false, '#17A2B8');

-- Permissions
INSERT INTO berechtigungen (id, permission_key, label, beschreibung, typ, app_id, app_name, gruppe) VALUES
('p-1', 'portal.dashboard.read', 'Dashboard anzeigen', 'Zugriff auf das Dashboard', 'LESEN', 'portal', 'Portal', 'Dashboard'),
('p-2', 'portal.appstore.read', 'AppStore anzeigen', 'Zugriff auf den AppStore', 'LESEN', 'portal', 'Portal', 'AppStore'),
('p-3', 'portal.appstore.install', 'Apps installieren', 'Apps aus dem AppStore installieren', 'SCHREIBEN', 'portal', 'Portal', 'AppStore'),
('p-4', 'portal.users.read', 'Benutzer anzeigen', 'Benutzerliste einsehen', 'LESEN', 'portal', 'Portal', 'Benutzer'),
('p-5', 'portal.users.write', 'Benutzer verwalten', 'Benutzer erstellen und bearbeiten', 'SCHREIBEN', 'portal', 'Portal', 'Benutzer'),
('p-6', 'portal.users.delete', 'Benutzer loeschen', 'Benutzer aus dem System entfernen', 'LOESCHEN', 'portal', 'Portal', 'Benutzer'),
('p-7', 'portal.roles.read', 'Rollen anzeigen', 'Rollenverwaltung einsehen', 'LESEN', 'portal', 'Portal', 'Rollen'),
('p-8', 'portal.roles.write', 'Rollen verwalten', 'Rollen erstellen und bearbeiten', 'SCHREIBEN', 'portal', 'Portal', 'Rollen'),
('p-9', 'portal.params.read', 'Parameter anzeigen', 'Parameterkonfiguration einsehen', 'LESEN', 'portal', 'Portal', 'Parameter'),
('p-10', 'portal.params.write', 'Parameter bearbeiten', 'Parameterwerte aendern', 'SCHREIBEN', 'portal', 'Portal', 'Parameter'),
('p-11', 'portal.batch.read', 'Batch-Jobs anzeigen', 'Batch-Job-Uebersicht einsehen', 'LESEN', 'portal', 'Portal', 'Batch-Jobs'),
('p-12', 'portal.batch.write', 'Batch-Jobs steuern', 'Batch-Jobs starten/stoppen', 'SCHREIBEN', 'portal', 'Portal', 'Batch-Jobs'),
('p-13', 'portal.messages.read', 'Nachrichten lesen', 'Nachrichten einsehen', 'LESEN', 'portal', 'Portal', 'Nachrichten'),
('p-14', 'portal.admin.access', 'Admin-Bereich', 'Zugriff auf den Admin-Bereich', 'ADMIN', 'portal', 'Portal', 'Administration'),
('p-15', 'kv-ai.read', 'KV AI Abrechnung lesen', 'Abrechnungsdaten einsehen', 'LESEN', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Abrechnung'),
('p-16', 'kv-ai.write', 'KV AI Abrechnung bearbeiten', 'Abrechnungen erstellen', 'SCHREIBEN', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Abrechnung'),
('p-17', 'smile-kh.read', 'smile KH lesen', 'Faelle und Rechnungen einsehen', 'LESEN', 'smile-kh', 'smile KH', 'Fallmanagement'),
('p-18', 'smile-kh.write', 'smile KH bearbeiten', 'Faelle bearbeiten', 'SCHREIBEN', 'smile-kh', 'smile KH', 'Fallmanagement'),
('p-19', 'arztregister.read', 'Arztregister lesen', 'Arztregister einsehen', 'LESEN', 'arztregister', 'Arztregister', 'Verwaltung'),
('p-20', 'arztregister.write', 'Arztregister bearbeiten', 'Leistungsorte verwalten', 'SCHREIBEN', 'arztregister', 'Arztregister', 'Verwaltung'),
('p-21', 'wb-foerderung.read', 'WB-Foerderung lesen', 'Weiterbildungsdaten einsehen', 'LESEN', 'wb-foerderung', 'WB-Foerderung', 'Verwaltung'),
('p-22', 'wb-foerderung.write', 'WB-Foerderung bearbeiten', 'Weiterbildungsdaten verwalten', 'SCHREIBEN', 'wb-foerderung', 'WB-Foerderung', 'Verwaltung'),
('p-23', 'portal.aufgaben.read', 'Aufgaben anzeigen', 'Aufgabensteuerung einsehen', 'LESEN', 'portal', 'Portal', 'Aufgaben'),
('p-24', 'portal.aufgaben.write', 'Aufgaben verwalten', 'Zuweisungsregeln erstellen', 'SCHREIBEN', 'portal', 'Portal', 'Aufgaben'),
('p-25', 'portal.cms.read', 'CMS lesen', 'CMS-Inhalte einsehen', 'LESEN', 'portal', 'Portal', 'CMS'),
('p-26', 'portal.cms.write', 'CMS bearbeiten', 'CMS-Inhalte erstellen', 'SCHREIBEN', 'portal', 'Portal', 'CMS'),
('p-27', 'portal.forms.read', 'Formulare anzeigen', 'Formulare einsehen', 'LESEN', 'portal', 'Portal', 'Formulare'),
('p-28', 'portal.forms.write', 'Formulare verwalten', 'Formulare erstellen', 'SCHREIBEN', 'portal', 'Portal', 'Formulare'),
('p-29', 'portal.ai.read', 'KI-Agenten anzeigen', 'KI-Agenten einsehen', 'LESEN', 'portal', 'Portal', 'KI-Agenten'),
('p-30', 'portal.ai.write', 'KI-Agenten verwalten', 'KI-Agenten konfigurieren', 'SCHREIBEN', 'portal', 'Portal', 'KI-Agenten'),
('p-31', 'portal.settings.write', 'Einstellungen aendern', 'Portaleinstellungen bearbeiten', 'SCHREIBEN', 'portal', 'Portal', 'Einstellungen');

-- Role-Permission assignments
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Admin: all permissions
('r-admin', 'p-1'), ('r-admin', 'p-2'), ('r-admin', 'p-3'), ('r-admin', 'p-4'),
('r-admin', 'p-5'), ('r-admin', 'p-6'), ('r-admin', 'p-7'), ('r-admin', 'p-8'),
('r-admin', 'p-9'), ('r-admin', 'p-10'), ('r-admin', 'p-11'), ('r-admin', 'p-12'),
('r-admin', 'p-13'), ('r-admin', 'p-14'), ('r-admin', 'p-15'), ('r-admin', 'p-16'),
('r-admin', 'p-17'), ('r-admin', 'p-18'), ('r-admin', 'p-19'), ('r-admin', 'p-20'),
('r-admin', 'p-21'), ('r-admin', 'p-22'), ('r-admin', 'p-23'), ('r-admin', 'p-24'),
('r-admin', 'p-25'), ('r-admin', 'p-26'), ('r-admin', 'p-27'), ('r-admin', 'p-28'),
('r-admin', 'p-29'), ('r-admin', 'p-30'), ('r-admin', 'p-31'),
-- Manager: read/write but no delete/admin
('r-manager', 'p-1'), ('r-manager', 'p-2'), ('r-manager', 'p-3'), ('r-manager', 'p-4'),
('r-manager', 'p-5'), ('r-manager', 'p-7'), ('r-manager', 'p-9'), ('r-manager', 'p-10'),
('r-manager', 'p-11'), ('r-manager', 'p-12'), ('r-manager', 'p-13'),
-- Sachbearbeiter: read + app-specific write
('r-sachbearbeiter', 'p-1'), ('r-sachbearbeiter', 'p-2'), ('r-sachbearbeiter', 'p-13'),
('r-sachbearbeiter', 'p-15'), ('r-sachbearbeiter', 'p-16'), ('r-sachbearbeiter', 'p-17'),
('r-sachbearbeiter', 'p-18'), ('r-sachbearbeiter', 'p-19'), ('r-sachbearbeiter', 'p-20'),
('r-sachbearbeiter', 'p-21'), ('r-sachbearbeiter', 'p-22'), ('r-sachbearbeiter', 'p-23'),
-- Leser: read only
('r-leser', 'p-1'), ('r-leser', 'p-2'), ('r-leser', 'p-13'), ('r-leser', 'p-15'),
('r-leser', 'p-17'), ('r-leser', 'p-19'), ('r-leser', 'p-21');

-- Users
INSERT INTO portal_users (id, vorname, nachname, email, iam_id, tenant_id, status, letzter_login, erstellt_am, iam_sync, initialen) VALUES
('u-1', 'Sabine', 'Mueller', 's.mueller@aok-nordwest.de', 'IAM-001', 't-aok-nw', 'AKTIV', '2026-03-12 08:30:00', '2024-01-15 10:00:00', true, 'SM'),
('u-2', 'Thomas', 'Weber', 't.weber@aok-nordwest.de', 'IAM-002', 't-aok-nw', 'AKTIV', '2026-03-11 14:22:00', '2024-02-01 09:00:00', true, 'TW'),
('u-3', 'Anna', 'Schmidt', 'a.schmidt@aok-nordwest.de', 'IAM-003', 't-aok-nw', 'AKTIV', '2026-03-10 16:45:00', '2024-03-10 11:30:00', true, 'AS'),
('u-4', 'Michael', 'Braun', 'm.braun@aok-nordwest.de', 'IAM-004', 't-aok-nw', 'INAKTIV', '2026-01-15 09:00:00', '2024-01-20 08:00:00', false, 'MB'),
('u-5', 'Lisa', 'Hoffmann', 'l.hoffmann@aok-bayern.de', 'IAM-005', 't-aok-by', 'AKTIV', '2026-03-12 07:15:00', '2024-04-01 10:00:00', true, 'LH'),
('u-6', 'Stefan', 'Koch', 's.koch@aok-bayern.de', 'IAM-006', 't-aok-by', 'AKTIV', '2026-03-11 11:00:00', '2024-05-15 09:30:00', true, 'SK'),
('u-7', 'Maria', 'Fischer', 'm.fischer@aok-bayern.de', 'IAM-007', 't-aok-by', 'GESPERRT', '2026-02-28 10:00:00', '2024-02-20 14:00:00', false, 'MF'),
('u-8', 'Peter', 'Becker', 'p.becker@tk.de', 'IAM-008', 't-tk', 'AKTIV', '2026-03-12 09:00:00', '2024-06-01 08:00:00', true, 'PB'),
('u-9', 'Julia', 'Wagner', 'j.wagner@tk.de', 'IAM-009', 't-tk', 'AKTIV', '2026-03-10 13:30:00', '2024-07-01 10:00:00', true, 'JW'),
('u-10', 'Frank', 'Schulz', 'f.schulz@tk.de', 'IAM-010', 't-tk', 'AKTIV', '2026-03-09 15:00:00', '2024-03-15 11:00:00', true, 'FS'),
('u-11', 'Claudia', 'Meyer', 'c.meyer@aok-nordwest.de', 'IAM-011', 't-aok-nw', 'AKTIV', '2026-03-11 10:30:00', '2024-08-01 09:00:00', true, 'CM'),
('u-12', 'Ralf', 'Schneider', 'r.schneider@aok-bayern.de', 'IAM-012', 't-aok-by', 'AKTIV', '2026-03-12 06:45:00', '2024-09-01 08:30:00', true, 'RS');

-- User-Role assignments
INSERT INTO user_roles (user_id, role_id) VALUES
('u-1', 'r-admin'), ('u-1', 'r-kv-admin'),
('u-2', 'r-manager'),
('u-3', 'r-sachbearbeiter'), ('u-3', 'r-abrechnung'),
('u-4', 'r-sachbearbeiter'),
('u-5', 'r-admin'),
('u-6', 'r-manager'), ('u-6', 'r-abrechnung'),
('u-7', 'r-leser'),
('u-8', 'r-manager'), ('u-8', 'r-it-support'),
('u-9', 'r-sachbearbeiter'),
('u-10', 'r-it-support'),
('u-11', 'r-sachbearbeiter'), ('u-11', 'r-abrechnung'),
('u-12', 'r-leser');

-- Portal Apps (14 apps)
INSERT INTO portal_apps (id, name, short_description, long_description, category, market_segment, app_type, vendor, vendor_name, version, icon_color, icon_initials, rating, review_count, install_count, tags, price, compatibility, featured, is_new, route) VALUES
('kv-ai-abrechnung', 'KV AI Abrechnung', 'KI-gestuetzte Abrechnungspruefung fuer Kassenaerztliche Vereinigungen', 'Automatische Pruefung und Optimierung von KV-Abrechnungen mittels kuenstlicher Intelligenz. Erkennt Fehler, schlaegt Korrekturen vor und beschleunigt den Abrechnungsprozess erheblich.', 'ABRECHNUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '3.2.1', '#006EC7', 'KV', 4.7, 23, 156, 'KI,Abrechnung,KV,Pruefung', 'lizenzpflichtig', 'Portal 2.0+', true, false, NULL),
('smile-kh', 'smile KH', 'Fallmanagement-System fuer Kostentraeger im Krankenhausbereich', 'Umfassende Loesung fuer das Fallmanagement im Krankenhausbereich. Verwaltet eingereichte Faelle, prueft DRG-Kodierungen und ueberwacht offene Rechnungen.', 'FALLMANAGEMENT', 'KOSTENTRAEGER', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '5.1.0', '#28DCAA', 'SK', 4.5, 18, 89, 'Fallmanagement,DRG,Krankenhaus,Kostentraeger', 'lizenzpflichtig', 'Portal 2.0+', true, false, NULL),
('arztregister', 'Arztregister', 'Verwaltung von Leistungsorten, Aerzten und Sprechzeiten', 'Zentrales Register fuer die Verwaltung von Leistungsorten, Aerzten, Sprechzeiten und Barrierefreiheit. Unterstuetzt den 5-Schritt-Erfassungswizard.', 'VERWALTUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '2.4.0', '#76C800', 'AR', 4.3, 12, 67, 'Arztregister,Leistungsorte,Sprechzeiten,Barrierefreiheit', 'kostenlos', 'Portal 2.0+', false, false, '/arztregister'),
('ki-agent-abrechnung', 'KI-Agent Abrechnung', 'Intelligenter Agent fuer automatisierte Abrechnungsverarbeitung', 'KI-basierter Agent der Abrechnungsprozesse automatisiert, Anomalien erkennt und proaktiv Optimierungsvorschlaege generiert.', 'KI_AGENTEN', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '1.0.0', '#461EBE', 'KA', 4.8, 8, 34, 'KI,Agent,Abrechnung,Automatisierung', 'lizenzpflichtig', 'Portal 2.0+', true, true, NULL),
('drg-pruefung-pro', 'DRG-Pruefung Pro', 'Erweiterte DRG-Pruefung und -Analyse fuer Kostentraeger', 'Professionelle DRG-Pruefungsloesung mit detaillierten Analysen, Benchmark-Vergleichen und automatischer Fehlererkennung.', 'ANALYSE', 'KOSTENTRAEGER', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '4.0.2', '#FF9868', 'DP', 4.6, 15, 78, 'DRG,Analyse,Pruefung,Benchmark', 'lizenzpflichtig', 'Portal 2.0+', false, false, NULL),
('md-kommunikation', 'MD-Kommunikation', 'Sichere Kommunikation mit dem Medizinischen Dienst', 'Verschluesselte Kommunikationsplattform fuer den Austausch mit dem Medizinischen Dienst. Unterstuetzt Dokumentenaustausch und Statusverfolgung.', 'KOMMUNIKATION', 'KOSTENTRAEGER', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '2.1.0', '#F566BA', 'MD', 4.2, 9, 45, 'Kommunikation,MD,Verschluesselung,Dokumente', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('bedarfsplanung-plus', 'Bedarfsplanung Plus', 'Datengetriebene Bedarfsplanung fuer Kassenaerztliche Vereinigungen', 'Analysewerkzeug fuer die aerztliche Bedarfsplanung mit Prognosemodellen und regionalen Versorgungsanalysen.', 'ANALYSE', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '1.5.0', '#FFFF00', 'BP', 4.4, 7, 23, 'Bedarfsplanung,Analyse,Prognose,Versorgung', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL),
('bitmarck-connector', 'BITMARCK Connector', 'Schnittstelle zu BITMARCK-Systemen fuer Kostentraeger', 'Integrationsmodul fuer die Anbindung an BITMARCK-Kernsysteme. Ermoeglicht bidirektionalen Datenaustausch.', 'INTEGRATION', 'KOSTENTRAEGER', 'INTEGRATION', 'ADESSO_HEALTH', 'adesso health', '3.0.1', '#17A2B8', 'BC', 4.1, 11, 56, 'BITMARCK,Integration,Schnittstelle,Datenaustausch', 'lizenzpflichtig', 'Portal 2.0+', false, false, NULL),
('formular-designer', 'Formular Designer', 'Visueller Editor fuer Geschaeftsformulare', 'Drag-and-Drop-Formulareditor fuer die Erstellung von Antraegen, Erfassungsmasken und Umfragen ohne Programmierkenntnisse.', 'FORMULARE', 'INFRASTRUKTUR_PLATTFORMEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '2.0.0', '#28A745', 'FD', 4.0, 6, 34, 'Formulare,Designer,Drag-and-Drop,No-Code', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('wb-foerderung', 'WB-Foerderung', 'Verwaltung der Weiterbildungsfoerderung fuer Aerzte', 'Umfassende Loesung fuer die Verwaltung von Weiterbildungsermaechtigungen, Foerderantraegen, Zueschuessen und Bescheiden.', 'VERWALTUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '1.8.0', '#FF9868', 'WB', 4.5, 10, 41, 'Weiterbildung,Foerderung,Aerzte,Antraege', 'kostenlos', 'Portal 2.0+', false, false, '/wb-foerderung'),
('dokumentengenerator', 'Dokumentengenerator', 'Automatische Erstellung von Geschaeftsdokumenten', 'Template-basierte Dokumentenerstellung fuer Bescheide, Briefe und Berichte mit Serienbrieffunktion.', 'INTEGRATION', 'INFRASTRUKTUR_PLATTFORMEN', 'INTEGRATION', 'ADESSO_SE', 'adesso SE', '2.3.0', '#887D75', 'DG', 4.0, 5, 28, 'Dokumente,Templates,Serienbriefe,Automatisierung', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('brain', 'br.AI.n', 'KI-Plattform fuer intelligente Datenanalyse', 'Enterprise-KI-Plattform mit vortrainierten Modellen fuer das Gesundheitswesen, NLP und Computer Vision.', 'INTEGRATION', 'INFRASTRUKTUR_PLATTFORMEN', 'INTEGRATION', 'ADESSO_SE', 'adesso SE', '1.2.0', '#461EBE', 'AI', 4.9, 14, 62, 'KI,ML,NLP,Datenanalyse', 'lizenzpflichtig', 'Portal 2.0+', true, true, NULL),
('epa-connector', 'ePA Connector', 'Anbindung an die elektronische Patientenakte', 'Standardisierte Schnittstelle zur elektronischen Patientenakte (ePA) gemaess gematik-Spezifikation.', 'INTEGRATION', 'LEISTUNGSERBRINGER', 'INTEGRATION', 'ADESSO_HEALTH', 'adesso health', '1.0.0', '#28DCAA', 'eP', 4.3, 4, 19, 'ePA,gematik,Patientenakte,Integration', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL),
('forschungsdaten-hub', 'Forschungsdaten Hub', 'Pseudonymisierte Datenbereitstellung fuer Forschungszwecke', 'Plattform fuer die sichere Bereitstellung pseudonymisierter Gesundheitsdaten an Forschungseinrichtungen.', 'ANALYSE', 'OEFFENTLICHE_HAND_FORSCHUNG', 'ANWENDUNG', 'ADESSO_HEALTH', 'adesso health', '1.1.0', '#76C800', 'FH', 4.2, 3, 12, 'Forschung,Pseudonymisierung,Daten,Open-Data', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL);

-- Installed Apps for AOK Nordwest
INSERT INTO installed_apps (id, tenant_id, app_id, installed_at, installed_by, status) VALUES
('ia-1', 't-aok-nw', 'kv-ai-abrechnung', '2025-06-15 10:00:00', 'u-1', 'active'),
('ia-2', 't-aok-nw', 'smile-kh', '2025-07-01 14:30:00', 'u-1', 'active'),
('ia-3', 't-aok-nw', 'arztregister', '2025-08-10 09:00:00', 'u-1', 'active'),
('ia-4', 't-aok-nw', 'md-kommunikation', '2025-09-01 11:00:00', 'u-2', 'active'),
('ia-5', 't-aok-nw', 'wb-foerderung', '2025-10-15 08:30:00', 'u-1', 'update_available');

-- Messages
INSERT INTO portal_messages (id, title, body, severity, category, sender, timestamp, is_read, app_id, tenant_id) VALUES
('msg-1', 'Systemwartung am 15.03.2026', 'Das Portal wird am 15.03.2026 von 02:00-04:00 Uhr fuer Wartungsarbeiten nicht verfuegbar sein.', 'WARNING', 'SYSTEM', 'System', '2026-03-10 09:00:00', false, NULL, 't-aok-nw'),
('msg-2', 'Neue Version: KV AI Abrechnung 3.2.1', 'Die neue Version beinhaltet verbesserte KI-Modelle und schnellere Verarbeitung.', 'INFO', 'APP', 'AppStore', '2026-03-09 14:30:00', false, 'kv-ai-abrechnung', 't-aok-nw'),
('msg-3', 'Fehler bei Batch-Job: Abrechnungsimport', 'Der naeechtliche Abrechnungsimport ist fehlgeschlagen. Bitte pruefen Sie die Protokolle.', 'ERROR', 'SYSTEM', 'Batch-System', '2026-03-08 06:15:00', false, NULL, 't-aok-nw'),
('msg-4', 'WB-Foerderung: Update verfuegbar', 'Version 1.9.0 der WB-Foerderung ist verfuegbar mit neuen Berichtsvorlagen.', 'INFO', 'APP', 'AppStore', '2026-03-07 10:00:00', true, 'wb-foerderung', 't-aok-nw'),
('msg-5', 'Neuer Benutzer hinzugefuegt', 'Claudia Meyer wurde dem Mandanten AOK Nordwest hinzugefuegt.', 'SUCCESS', 'ADMIN', 'Administration', '2026-03-06 11:30:00', true, NULL, 't-aok-nw'),
('msg-6', 'Sicherheitshinweis: Passwoerter aktualisieren', 'Bitte aktualisieren Sie Ihr Passwort gemaess der neuen Sicherheitsrichtlinie.', 'WARNING', 'SYSTEM', 'Sicherheit', '2026-03-05 08:00:00', false, NULL, 't-aok-nw'),
('msg-7', 'smile KH: 5 neue Faelle eingereicht', '5 neue Faelle wurden von Krankenhaeusern eingereicht und warten auf Pruefung.', 'INFO', 'APP', 'smile KH', '2026-03-04 15:45:00', true, 'smile-kh', 't-aok-nw'),
('msg-8', 'Quartalsbericht Q1/2026 verfuegbar', 'Der automatisch generierte Quartalsbericht ist jetzt im CMS verfuegbar.', 'SUCCESS', 'SYSTEM', 'Berichtswesen', '2026-03-03 09:00:00', true, NULL, 't-aok-nw');

-- Parameters (32 parameters)
INSERT INTO portal_parameters (id, param_key, label, description, app_id, app_name, param_group, type, value, default_value, required, validation_rules, options, unit, sensitive, hot_reload, last_modified, last_modified_by, created_at) VALUES
('par-1', 'kv-ai.model.version', 'KI-Modell Version', 'Aktive Version des KI-Modells', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'KI-Konfiguration', 'SELECT', '3.2', '3.0', true, NULL, 'v2.8,v3.0,v3.1,3.2', NULL, false, false, '2026-03-01 10:00:00', 'Sabine Mueller', '2025-06-15 10:00:00'),
('par-2', 'kv-ai.confidence.threshold', 'Konfidenz-Schwellenwert', 'Minimale Konfidenz fuer automatische Freigabe', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'KI-Konfiguration', 'NUMBER', '0.85', '0.80', true, '[{"type":"min","value":"0.5","message":"Mindestens 0.5"},{"type":"max","value":"1.0","message":"Maximal 1.0"}]', NULL, '%', false, true, '2026-02-15 14:00:00', 'Thomas Weber', '2025-06-15 10:00:00'),
('par-3', 'kv-ai.batch.size', 'Batch-Groesse', 'Anzahl Abrechnungen pro Batch-Verarbeitung', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Verarbeitung', 'NUMBER', '500', '200', false, NULL, NULL, 'Eintraege', false, true, '2026-01-20 09:00:00', 'Sabine Mueller', '2025-06-15 10:00:00'),
('par-4', 'kv-ai.api.endpoint', 'API-Endpunkt', 'URL des KI-Service-Endpunkts', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Verbindung', 'URL', 'https://ki-service.adesso-health.de/v3/predict', 'https://ki-service.adesso-health.de/v3/predict', true, NULL, NULL, NULL, false, false, '2025-12-01 08:00:00', 'Frank Schulz', '2025-06-15 10:00:00'),
('par-5', 'kv-ai.api.key', 'API-Schluessel', 'Authentifizierungsschluessel fuer den KI-Service', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Verbindung', 'PASSWORD', 'sk-ah-kv-2026-xxxx', '', true, NULL, NULL, NULL, true, false, '2026-03-01 10:00:00', 'Sabine Mueller', '2025-06-15 10:00:00'),
('par-6', 'kv-ai.notification.email', 'Benachrichtigungs-Email', 'Email-Adresse fuer Systembenachrichtigungen', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Benachrichtigung', 'EMAIL', 'kv-ai-alerts@aok-nordwest.de', '', false, NULL, NULL, NULL, false, false, '2025-11-15 10:00:00', 'Thomas Weber', '2025-06-15 10:00:00'),
('par-7', 'smile-kh.pruefung.auto', 'Automatische Pruefung', 'Automatische Pruefung neuer Faelle aktivieren', 'smile-kh', 'smile KH', 'Pruefung', 'BOOLEAN', 'true', 'false', false, NULL, NULL, NULL, false, true, '2026-02-20 11:00:00', 'Anna Schmidt', '2025-07-01 14:30:00'),
('par-8', 'smile-kh.pruefung.frist', 'Pruefungsfrist', 'Maximale Bearbeitungszeit in Tagen', 'smile-kh', 'smile KH', 'Pruefung', 'NUMBER', '14', '30', true, '[{"type":"min","value":"1","message":"Mindestens 1 Tag"},{"type":"max","value":"90","message":"Maximal 90 Tage"}]', NULL, 'Tage', false, false, '2026-01-10 09:00:00', 'Sabine Mueller', '2025-07-01 14:30:00'),
('par-9', 'smile-kh.ampel.gelb.schwelle', 'Gelbe Ampel Schwelle', 'Betragsschwelle fuer gelbe Ampel', 'smile-kh', 'smile KH', 'Ampelsystem', 'NUMBER', '5000', '3000', true, NULL, NULL, 'EUR', false, true, '2026-02-01 10:00:00', 'Thomas Weber', '2025-07-01 14:30:00'),
('par-10', 'smile-kh.ampel.rot.schwelle', 'Rote Ampel Schwelle', 'Betragsschwelle fuer rote Ampel', 'smile-kh', 'smile KH', 'Ampelsystem', 'NUMBER', '15000', '10000', true, NULL, NULL, 'EUR', false, true, '2026-02-01 10:00:00', 'Thomas Weber', '2025-07-01 14:30:00'),
('par-11', 'smile-kh.export.format', 'Export-Format', 'Standardformat fuer Datenexporte', 'smile-kh', 'smile KH', 'Export', 'SELECT', 'xlsx', 'csv', false, NULL, 'csv,xlsx,pdf,xml', NULL, false, false, '2025-10-01 08:00:00', 'Anna Schmidt', '2025-07-01 14:30:00'),
('par-12', 'arztregister.sync.interval', 'Synchronisierungs-Intervall', 'Intervall fuer die Datensynchronisierung', 'arztregister', 'Arztregister', 'Synchronisierung', 'SELECT', '6h', '24h', false, NULL, '1h,6h,12h,24h', NULL, false, true, '2026-01-15 09:00:00', 'Sabine Mueller', '2025-08-10 09:00:00'),
('par-13', 'arztregister.max.leistungsorte', 'Max. Leistungsorte', 'Maximale Anzahl Leistungsorte pro Arzt', 'arztregister', 'Arztregister', 'Limits', 'NUMBER', '5', '3', false, NULL, NULL, NULL, false, false, '2025-09-01 10:00:00', 'Thomas Weber', '2025-08-10 09:00:00'),
('par-14', 'arztregister.barrierefreiheit.pflicht', 'Barrierefreiheit Pflichtfeld', 'Barrierefreiheitsangaben als Pflichtfeld', 'arztregister', 'Arztregister', 'Erfassung', 'BOOLEAN', 'true', 'false', false, NULL, NULL, NULL, false, false, '2025-12-01 10:00:00', 'Sabine Mueller', '2025-08-10 09:00:00'),
('par-15', 'wb-foerderung.antrag.frist', 'Antragsfrist', 'Einreichungsfrist fuer Foerderantraege', 'wb-foerderung', 'WB-Foerderung', 'Antraege', 'DATE', '2026-06-30', '2026-12-31', true, NULL, NULL, NULL, false, false, '2026-01-05 10:00:00', 'Sabine Mueller', '2025-10-15 08:30:00'),
('par-16', 'wb-foerderung.zuschuss.max', 'Max. Zuschuss', 'Maximaler monatlicher Zuschussbetrag', 'wb-foerderung', 'WB-Foerderung', 'Zuschuss', 'NUMBER', '5400', '5000', true, NULL, NULL, 'EUR', false, false, '2026-02-01 09:00:00', 'Thomas Weber', '2025-10-15 08:30:00'),
('par-17', 'wb-foerderung.erhoehung.prozent', 'Erhoehungssatz', 'Prozentualer Erhoehungssatz fuer Zueschuesse', 'wb-foerderung', 'WB-Foerderung', 'Zuschuss', 'NUMBER', '15', '10', false, NULL, NULL, '%', false, true, '2026-01-20 10:00:00', 'Sabine Mueller', '2025-10-15 08:30:00'),
('par-18', 'portal.session.timeout', 'Session-Timeout', 'Automatisches Abmelden nach Inaktivitaet', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '30', '15', true, NULL, NULL, 'Minuten', false, true, '2026-03-01 08:00:00', 'Sabine Mueller', '2024-01-01 00:00:00'),
('par-19', 'portal.2fa.enabled', 'Zwei-Faktor-Authentifizierung', 'Zwei-Faktor-Authentifizierung aktivieren', 'portal', 'Portal', 'Sicherheit', 'BOOLEAN', 'true', 'false', false, NULL, NULL, NULL, false, false, '2026-02-15 10:00:00', 'Sabine Mueller', '2024-01-01 00:00:00'),
('par-20', 'portal.password.min.length', 'Min. Passwortlaenge', 'Minimale Laenge fuer Passwoerter', 'portal', 'Portal', 'Sicherheit', 'NUMBER', '12', '8', true, NULL, NULL, 'Zeichen', false, false, '2025-06-01 10:00:00', 'Frank Schulz', '2024-01-01 00:00:00'),
('par-21', 'portal.email.smtp.host', 'SMTP-Server', 'Hostname des SMTP-Servers', 'portal', 'Portal', 'Email', 'STRING', 'smtp.aok-nordwest.de', '', true, NULL, NULL, NULL, false, false, '2025-01-15 10:00:00', 'Frank Schulz', '2024-01-01 00:00:00'),
('par-22', 'portal.email.smtp.port', 'SMTP-Port', 'Port des SMTP-Servers', 'portal', 'Portal', 'Email', 'NUMBER', '587', '25', true, NULL, NULL, NULL, false, false, '2025-01-15 10:00:00', 'Frank Schulz', '2024-01-01 00:00:00'),
('par-23', 'portal.email.from', 'Absender-Email', 'Standard-Absenderadresse fuer System-Emails', 'portal', 'Portal', 'Email', 'EMAIL', 'portal@aok-nordwest.de', 'noreply@portal.de', true, NULL, NULL, NULL, false, false, '2025-01-15 10:00:00', 'Frank Schulz', '2024-01-01 00:00:00'),
('par-24', 'portal.maintenance.message', 'Wartungsmeldung', 'Nachricht fuer geplante Wartungsarbeiten', 'portal', 'Portal', 'System', 'TEXTAREA', 'Geplante Wartung am 15.03.2026, 02:00-04:00 Uhr', '', false, NULL, NULL, NULL, false, true, '2026-03-10 09:00:00', 'Sabine Mueller', '2024-01-01 00:00:00'),
('par-25', 'portal.max.upload.size', 'Max. Upload-Groesse', 'Maximale Dateigroesse fuer Uploads', 'portal', 'Portal', 'System', 'NUMBER', '50', '10', false, NULL, NULL, 'MB', false, false, '2025-08-01 10:00:00', 'Frank Schulz', '2024-01-01 00:00:00'),
('par-26', 'md-kommunikation.encryption', 'Verschluesselung', 'Art der Nachrichtenverschluesselung', 'md-kommunikation', 'MD-Kommunikation', 'Sicherheit', 'SELECT', 'AES-256', 'AES-128', true, NULL, 'AES-128,AES-256,RSA-2048', NULL, false, false, '2025-11-01 10:00:00', 'Frank Schulz', '2025-09-01 11:00:00'),
('par-27', 'md-kommunikation.retention.days', 'Aufbewahrungsfrist', 'Aufbewahrungsfrist fuer Nachrichten', 'md-kommunikation', 'MD-Kommunikation', 'Speicher', 'NUMBER', '365', '180', false, NULL, NULL, 'Tage', false, false, '2025-10-01 10:00:00', 'Thomas Weber', '2025-09-01 11:00:00'),
('par-28', 'smile-kh.mahnung.automatisch', 'Automatisches Mahnwesen', 'Automatische Mahnung bei ueberfaelligen Rechnungen', 'smile-kh', 'smile KH', 'Rechnungen', 'BOOLEAN', 'true', 'true', false, NULL, NULL, NULL, false, true, '2026-01-15 10:00:00', 'Anna Schmidt', '2025-07-01 14:30:00'),
('par-29', 'smile-kh.mahnung.frist', 'Mahnfrist', 'Tage nach Faelligkeit bis zur automatischen Mahnung', 'smile-kh', 'smile KH', 'Rechnungen', 'NUMBER', '30', '14', true, NULL, NULL, 'Tage', false, true, '2026-01-15 10:00:00', 'Anna Schmidt', '2025-07-01 14:30:00'),
('par-30', 'portal.audit.retention', 'Audit-Log Aufbewahrung', 'Aufbewahrungsfrist fuer Audit-Logs', 'portal', 'Portal', 'Compliance', 'NUMBER', '730', '365', true, NULL, NULL, 'Tage', false, false, '2025-06-01 10:00:00', 'Sabine Mueller', '2024-01-01 00:00:00'),
('par-31', 'portal.gdpr.anonymize.after', 'DSGVO Anonymisierung', 'Personenbezogene Daten anonymisieren nach', 'portal', 'Portal', 'Compliance', 'NUMBER', '1095', '730', true, NULL, NULL, 'Tage', false, false, '2025-06-01 10:00:00', 'Sabine Mueller', '2024-01-01 00:00:00'),
('par-32', 'kv-ai.retry.count', 'Wiederholungsversuche', 'Anzahl Wiederholungsversuche bei Fehler', 'kv-ai-abrechnung', 'KV AI Abrechnung', 'Verarbeitung', 'NUMBER', '3', '3', false, NULL, NULL, NULL, false, true, '2025-09-01 10:00:00', 'Frank Schulz', '2025-06-15 10:00:00');

-- Aufgaben Gruppen
INSERT INTO aufgaben_gruppen (id, name, beschreibung, mitglieder_ids) VALUES
('ag-1', 'Abrechnungsteam Nord', 'Zustaendig fuer Abrechnungen im Norden', 'u-3,u-11'),
('ag-2', 'Fallmanagement', 'Team fuer Fallbearbeitung im KH-Bereich', 'u-3,u-9'),
('ag-3', 'KV-Verwaltung', 'Verwaltung von KV-Angelegenheiten', 'u-2,u-11'),
('ag-4', 'IT-Support', 'Technischer Support fuer Portalnutzer', 'u-8,u-10');

-- Aufgaben Zuweisungen (12 rules)
INSERT INTO aufgaben_zuweisungen (id, bezeichnung, kriterium, kriterium_wert, zuweisung_typ, mitarbeiter_id, gruppe_id, produkt_id, gueltig_von, gueltig_bis, prioritaet, erstellt_am, erstellt_von, beschreibung) VALUES
('az-1', 'IK AOK Nordwest Abrechnung', 'IK_NUMMER', '104212059', 'mitarbeiter', 'u-3', NULL, 'kv-ai-abrechnung', '2026-01-01', '2026-12-31', 'HOCH', '2025-12-15 10:00:00', 'Sabine Mueller', 'Alle Abrechnungen mit IK der AOK Nordwest'),
('az-2', 'PLZ-Bereich 44 Fallmanagement', 'PLZ', '44*', 'gruppe', NULL, 'ag-2', 'smile-kh', '2026-01-01', '2026-12-31', 'MITTEL', '2025-12-15 10:00:00', 'Sabine Mueller', 'Faelle aus dem PLZ-Bereich 44'),
('az-3', 'IK Uniklinik Muenster', 'IK_NUMMER', '260530014', 'mitarbeiter', 'u-11', NULL, 'smile-kh', '2026-01-01', '2026-06-30', 'HOCH', '2025-12-20 09:00:00', 'Thomas Weber', NULL),
('az-4', 'PLZ-Bereich 48 Arztregister', 'PLZ', '48*', 'mitarbeiter', 'u-2', NULL, 'arztregister', '2026-01-01', '2026-12-31', 'NIEDRIG', '2026-01-05 10:00:00', 'Sabine Mueller', 'Leistungsorte im PLZ-Bereich 48'),
('az-5', 'Betriebsnummer Grossklinik', 'BETRIEBSNUMMER', '12345678', 'gruppe', NULL, 'ag-1', 'kv-ai-abrechnung', '2026-01-01', '2026-12-31', 'HOCH', '2026-01-10 08:00:00', 'Thomas Weber', NULL),
('az-6', 'Name Mueller Weiterbildung', 'NAME', 'Mueller', 'mitarbeiter', 'u-3', NULL, 'wb-foerderung', '2026-02-01', '2026-12-31', 'MITTEL', '2026-01-20 10:00:00', 'Sabine Mueller', 'Weiterbildungsantraege von Dr. Mueller'),
('az-7', 'IK TK Abrechnung', 'IK_NUMMER', '101575519', 'gruppe', NULL, 'ag-1', 'kv-ai-abrechnung', '2025-06-01', '2025-12-31', 'MITTEL', '2025-05-15 10:00:00', 'Sabine Mueller', 'Abgelaufene Regel fuer TK'),
('az-8', 'PLZ-Bereich 80 Bayern', 'PLZ', '80*', 'mitarbeiter', 'u-6', NULL, 'smile-kh', '2026-01-01', '2026-12-31', 'MITTEL', '2025-12-20 10:00:00', 'Lisa Hoffmann', 'Faelle aus dem Muenchner Raum'),
('az-9', 'Geburtsdatum vor 1960', 'GEBURTSDATUM', '< 01.01.1960', 'gruppe', NULL, 'ag-2', 'smile-kh', '2026-01-01', '2026-12-31', 'HOCH', '2026-01-15 09:00:00', 'Thomas Weber', 'Aeltere Patienten erhalten spezielle Pruefung'),
('az-10', 'PLZ-Bereich 10 Berlin', 'PLZ', '10*', 'mitarbeiter', 'u-9', NULL, 'arztregister', '2025-01-01', '2025-12-31', 'NIEDRIG', '2024-12-20 10:00:00', 'Peter Becker', 'Abgelaufene Berliner Zuweisung'),
('az-11', 'IK Vivantes Kliniken', 'IK_NUMMER', '261101015', 'mitarbeiter', 'u-8', NULL, 'smile-kh', '2026-03-01', '2026-12-31', 'HOCH', '2026-02-25 10:00:00', 'Peter Becker', NULL),
('az-12', 'Name Schmidt Abrechnung', 'NAME', 'Schmidt', 'gruppe', NULL, 'ag-3', 'kv-ai-abrechnung', '2026-01-01', '2026-12-31', 'NIEDRIG', '2026-01-05 10:00:00', 'Sabine Mueller', 'Abrechnungen mit Bezug zu Schmidt');

-- Batch Jobs
INSERT INTO batch_jobs (id, name, beschreibung, produkt_id, schedule, status, gestartet_um, beendet_um, naechster_lauf, dauer, fortschritt, protokoll) VALUES
('bj-1', 'Naechtlicher Abrechnungsimport', 'Importiert neue Abrechnungsdaten aus dem KV-System', 'kv-ai-abrechnung', '0 2 * * *', 'ERFOLGREICH', '2026-03-12 02:00:00', '2026-03-12 02:45:00', '2026-03-13 02:00:00', '45min', NULL, '[{"zeit":"2026-03-12T02:00:00","level":"info","nachricht":"Job gestartet"},{"zeit":"2026-03-12T02:05:00","level":"info","nachricht":"12.458 Datensaetze gefunden"},{"zeit":"2026-03-12T02:30:00","level":"warn","nachricht":"23 Datensaetze mit fehlenden Feldern uebersprungen"},{"zeit":"2026-03-12T02:45:00","level":"info","nachricht":"Import abgeschlossen: 12.435 Datensaetze importiert"}]'),
('bj-2', 'DRG-Validierung', 'Prueft DRG-Kodierungen gegen aktuelle Kataloge', 'smile-kh', '0 4 * * 1', 'LAEUFT', '2026-03-12 04:00:00', NULL, '2026-03-19 04:00:00', NULL, 67, '[{"zeit":"2026-03-12T04:00:00","level":"info","nachricht":"Validierung gestartet"},{"zeit":"2026-03-12T04:15:00","level":"info","nachricht":"254 Faelle werden geprueft"},{"zeit":"2026-03-12T04:30:00","level":"info","nachricht":"170/254 Faelle validiert"}]'),
('bj-3', 'Arztregister Synchronisation', 'Synchronisiert Daten mit dem zentralen Arztregister', 'arztregister', '0 6 * * *', 'ERFOLGREICH', '2026-03-12 06:00:00', '2026-03-12 06:12:00', '2026-03-13 06:00:00', '12min', NULL, '[{"zeit":"2026-03-12T06:00:00","level":"info","nachricht":"Sync gestartet"},{"zeit":"2026-03-12T06:12:00","level":"info","nachricht":"Sync abgeschlossen: 1.234 Eintraege aktualisiert"}]'),
('bj-4', 'Mahnlauf Rechnungen', 'Automatischer Mahnlauf fuer ueberfaellige Rechnungen', 'smile-kh', '0 8 * * 1-5', 'PAUSIERT', '2026-03-11 08:00:00', NULL, '2026-03-12 08:00:00', NULL, 34, '[{"zeit":"2026-03-11T08:00:00","level":"info","nachricht":"Mahnlauf gestartet"},{"zeit":"2026-03-11T08:05:00","level":"info","nachricht":"7 ueberfaellige Rechnungen gefunden"},{"zeit":"2026-03-11T08:10:00","level":"warn","nachricht":"Pausiert durch Benutzer Thomas Weber"}]'),
('bj-5', 'WB-Foerderung Berichterstellung', 'Generiert monatliche Foerderberichte', 'wb-foerderung', '0 0 1 * *', 'ERFOLGREICH', '2026-03-01 00:00:00', '2026-03-01 00:35:00', '2026-04-01 00:00:00', '35min', NULL, '[{"zeit":"2026-03-01T00:00:00","level":"info","nachricht":"Berichtsgenerierung gestartet"},{"zeit":"2026-03-01T00:35:00","level":"info","nachricht":"3 Berichte erfolgreich generiert"}]'),
('bj-6', 'Email-Digest Versand', 'Versendet taegliche Email-Zusammenfassungen', 'portal', '0 7 * * 1-5', 'FEHLGESCHLAGEN', '2026-03-11 07:00:00', '2026-03-11 07:02:00', '2026-03-12 07:00:00', '2min', NULL, '[{"zeit":"2026-03-11T07:00:00","level":"info","nachricht":"Email-Versand gestartet"},{"zeit":"2026-03-11T07:01:00","level":"error","nachricht":"SMTP-Verbindung fehlgeschlagen: Connection refused"},{"zeit":"2026-03-11T07:02:00","level":"error","nachricht":"Job abgebrochen nach 3 Versuchen"}]'),
('bj-7', 'Datenbank-Backup', 'Taegliches Backup der Portaldatenbank', 'portal', '0 1 * * *', 'ERFOLGREICH', '2026-03-12 01:00:00', '2026-03-12 01:15:00', '2026-03-13 01:00:00', '15min', NULL, '[{"zeit":"2026-03-12T01:00:00","level":"info","nachricht":"Backup gestartet"},{"zeit":"2026-03-12T01:15:00","level":"info","nachricht":"Backup abgeschlossen: 2.3 GB"}]'),
('bj-8', 'Audit-Log Archivierung', 'Archiviert Audit-Logs aelter als 2 Jahre', 'portal', '0 3 1 */3 *', 'GESTOPPT', '2026-01-01 03:00:00', '2026-01-01 03:05:00', '2026-04-01 03:00:00', '5min', NULL, '[{"zeit":"2026-01-01T03:00:00","level":"info","nachricht":"Archivierung gestartet"},{"zeit":"2026-01-01T03:05:00","level":"info","nachricht":"Gestoppt: Keine Logs zum Archivieren gefunden"}]');

-- Eingereichte Faelle (smile KH)
INSERT INTO eingereichte_faelle (id, fall_nr, patient, krankenhaus, drg_code, einreichungs_datum, betrag, ampel, ampel_grund) VALUES
('ef-1', 'F-2026-0847', 'Heinrich Meier', 'Universitaetsklinikum Muenster', 'I68B', '2026-03-10', 12450.00, 'GRUEN', 'Regelkonforme Kodierung'),
('ef-2', 'F-2026-0848', 'Ursula Becker', 'Evangelisches Klinikum Bethel', 'G67C', '2026-03-10', 8920.00, 'GELB', 'Verweildauer ueberschreitet obere Grenzverweildauer'),
('ef-3', 'F-2026-0849', 'Klaus Wagner', 'Klinikum Dortmund', 'F25Z', '2026-03-09', 23180.00, 'ROT', 'DRG-Code stimmt nicht mit dokumentierten Prozeduren ueberein'),
('ef-4', 'F-2026-0850', 'Maria Fischer', 'St. Franziskus-Hospital', 'B80Z', '2026-03-09', 4560.00, 'GRUEN', 'Regelkonforme Kodierung'),
('ef-5', 'F-2026-0851', 'Hans Schulz', 'Marienhospital Osnabrueck', 'I24Z', '2026-03-08', 15780.00, 'ROT', 'Fallzusammenfuehrung erforderlich'),
('ef-6', 'F-2026-0852', 'Petra Hoffmann', 'Herz- und Diabeteszentrum NRW', 'F12A', '2026-03-08', 31200.00, 'GELB', 'Hochkostiger Fall - manuelle Pruefung empfohlen'),
('ef-7', 'F-2026-0853', 'Wolfgang Braun', 'Clemenshospital Muenster', 'G48B', '2026-03-07', 6780.00, 'GRUEN', 'Regelkonforme Kodierung'),
('ef-8', 'F-2026-0854', 'Ingrid Mueller', 'Klinikum Bielefeld', 'I09C', '2026-03-07', 9340.00, 'GELB', 'Nebendiagnosen unvollstaendig'),
('ef-9', 'F-2026-0855', 'Dieter Schmitz', 'Universitaetsklinikum Essen', 'A13G', '2026-03-06', 45670.00, 'ROT', 'Beatmungsstunden ueberpruefen'),
('ef-10', 'F-2026-0856', 'Renate Koch', 'Knappschaftskrankenhaus Recklinghausen', 'J64B', '2026-03-06', 7890.00, 'GRUEN', 'Regelkonforme Kodierung');

-- Offene Rechnungen (smile KH)
INSERT INTO offene_rechnungen (id, rechnungs_nr, krankenhaus, patient, rechnungs_datum, faelligkeits_datum, betrag, bezahlt, status, tage_offen, bemerkung) VALUES
('or-1', 'R-2026-1234', 'Universitaetsklinikum Muenster', 'Heinrich Meier', '2026-02-15', '2026-03-15', 12450.00, 0.00, 'OFFEN', 25, NULL),
('or-2', 'R-2026-1180', 'Klinikum Dortmund', 'Klaus Wagner', '2026-02-01', '2026-03-01', 23180.00, 0.00, 'IN_PRUEFUNG', 39, 'DRG-Kodierung wird geprueft'),
('or-3', 'R-2026-1120', 'Evangelisches Klinikum Bethel', 'Ursula Becker', '2026-01-20', '2026-02-20', 8920.00, 4460.00, 'TEILBEZAHLT', 51, 'Erste Rate bezahlt'),
('or-4', 'R-2026-1089', 'Herz- und Diabeteszentrum NRW', 'Petra Hoffmann', '2026-01-10', '2026-02-10', 31200.00, 0.00, 'GEMAHNT', 61, 'Erste Mahnung versendet am 25.02.2026'),
('or-5', 'R-2026-1250', 'St. Franziskus-Hospital', 'Maria Fischer', '2026-02-20', '2026-03-20', 4560.00, 0.00, 'OFFEN', 20, NULL),
('or-6', 'R-2026-1190', 'Marienhospital Osnabrueck', 'Hans Schulz', '2026-02-05', '2026-03-05', 15780.00, 0.00, 'IN_PRUEFUNG', 35, 'Fallzusammenfuehrung wird geprueft'),
('or-7', 'R-2026-1210', 'Clemenshospital Muenster', 'Wolfgang Braun', '2026-02-10', '2026-03-10', 6780.00, 6780.00, 'OFFEN', 30, 'Zahlung eingegangen, wird verbucht');
