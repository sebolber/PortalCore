-- Health Portal - Stammdaten (Rollen, Berechtigungen, App-Katalog)
-- Keine Test-Mandanten oder Test-Benutzer. Diese werden ueber den Setup-Wizard angelegt.

-- Roles
INSERT INTO portal_rollen (id, name, beschreibung, hierarchie, scope, benutzer_anzahl, system_rolle, farbe) VALUES
('r-admin', 'Administrator', 'Vollzugriff auf alle Portalfunktionen', 100, 'global', 0, true, '#CC3333'),
('r-manager', 'Manager', 'Verwaltung von Benutzern und Apps', 80, 'global', 0, true, '#006EC7'),
('r-sachbearbeiter', 'Sachbearbeiter', 'Bearbeitung von Faellen und Aufgaben', 60, 'global', 0, false, '#28A745'),
('r-leser', 'Leser', 'Nur-Lese-Zugriff', 20, 'global', 0, false, '#887D75'),
('r-abrechnung', 'Abrechnungsexperte', 'Zugriff auf Abrechnungs-Apps', 50, 'global', 0, false, '#FF9868'),
('r-it-support', 'IT-Support', 'Technischer Support und Batch-Jobs', 70, 'global', 0, false, '#17A2B8');

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

-- Portal Apps (App-Katalog)
INSERT INTO portal_apps (id, name, short_description, long_description, category, market_segment, app_type, vendor, vendor_name, version, icon_color, icon_initials, rating, review_count, install_count, tags, price, compatibility, featured, is_new, route) VALUES
('kv-ai-abrechnung', 'KV AI Abrechnung', 'KI-gestuetzte Abrechnungspruefung fuer Kassenaerztliche Vereinigungen', 'Automatische Pruefung und Optimierung von KV-Abrechnungen mittels kuenstlicher Intelligenz. Erkennt Fehler, schlaegt Korrekturen vor und beschleunigt den Abrechnungsprozess erheblich.', 'ABRECHNUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '3.2.1', '#006EC7', 'KV', 4.7, 23, 156, 'KI,Abrechnung,KV,Pruefung', 'lizenzpflichtig', 'Portal 2.0+', true, false, NULL),
('smile-kh', 'smile KH', 'Fallmanagement-System fuer Kostentraeger im Krankenhausbereich', 'Umfassende Loesung fuer das Fallmanagement im Krankenhausbereich. Verwaltet eingereichte Faelle, prueft DRG-Kodierungen und ueberwacht offene Rechnungen.', 'FALLMANAGEMENT', 'KOSTENTRAEGER', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '5.1.0', '#28DCAA', 'SK', 4.5, 18, 89, 'Fallmanagement,DRG,Krankenhaus,Kostentraeger', 'lizenzpflichtig', 'Portal 2.0+', true, false, NULL),
('arztregister', 'Arztregister', 'Verwaltung von Leistungsorten, Aerzten und Sprechzeiten', 'Zentrales Register fuer die Verwaltung von Leistungsorten, Aerzten, Sprechzeiten und Barrierefreiheit. Unterstuetzt den 5-Schritt-Erfassungswizard.', 'VERWALTUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '2.4.0', '#76C800', 'AR', 4.3, 12, 67, 'Arztregister,Leistungsorte,Sprechzeiten,Barrierefreiheit', 'kostenlos', 'Portal 2.0+', false, false, '/arztregister'),
('ki-agent-abrechnung', 'KI-Agent Abrechnung', 'Intelligenter Agent fuer automatisierte Abrechnungsverarbeitung', 'KI-basierter Agent der Abrechnungsprozesse automatisiert, Anomalien erkennt und proaktiv Optimierungsvorschlaege generiert.', 'KI_AGENTEN', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '1.0.0', '#461EBE', 'KA', 4.8, 8, 34, 'KI,Agent,Abrechnung,Automatisierung', 'lizenzpflichtig', 'Portal 2.0+', true, true, NULL),
('drg-pruefung-pro', 'DRG-Pruefung Pro', 'Erweiterte DRG-Pruefung und -Analyse fuer Kostentraeger', 'Professionelle DRG-Pruefungsloesung mit detaillierten Analysen, Benchmark-Vergleichen und automatischer Fehlererkennung.', 'ANALYSE', 'KOSTENTRAEGER', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '4.0.2', '#FF9868', 'DP', 4.6, 15, 78, 'DRG,Analyse,Pruefung,Benchmark', 'lizenzpflichtig', 'Portal 2.0+', false, false, NULL),
('md-kommunikation', 'MD-Kommunikation', 'Sichere Kommunikation mit dem Medizinischen Dienst', 'Verschluesselte Kommunikationsplattform fuer den Austausch mit dem Medizinischen Dienst. Unterstuetzt Dokumentenaustausch und Statusverfolgung.', 'KOMMUNIKATION', 'KOSTENTRAEGER', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '2.1.0', '#F566BA', 'MD', 4.2, 9, 45, 'Kommunikation,MD,Verschluesselung,Dokumente', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('bedarfsplanung-plus', 'Bedarfsplanung Plus', 'Datengetriebene Bedarfsplanung fuer Kassenaerztliche Vereinigungen', 'Analysewerkzeug fuer die aerztliche Bedarfsplanung mit Prognosemodellen und regionalen Versorgungsanalysen.', 'ANALYSE', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '1.5.0', '#FFFF00', 'BP', 4.4, 7, 23, 'Bedarfsplanung,Analyse,Prognose,Versorgung', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL),
('bitmarck-connector', 'BITMARCK Connector', 'Schnittstelle zu BITMARCK-Systemen fuer Kostentraeger', 'Integrationsmodul fuer die Anbindung an BITMARCK-Kernsysteme. Ermoeglicht bidirektionalen Datenaustausch.', 'INTEGRATION', 'KOSTENTRAEGER', 'INTEGRATION', 'HEALTH_PORTAL', 'Health Portal', '3.0.1', '#17A2B8', 'BC', 4.1, 11, 56, 'BITMARCK,Integration,Schnittstelle,Datenaustausch', 'lizenzpflichtig', 'Portal 2.0+', false, false, NULL),
('formular-designer', 'Formular Designer', 'Visueller Editor fuer Geschaeftsformulare', 'Drag-and-Drop-Formulareditor fuer die Erstellung von Antraegen, Erfassungsmasken und Umfragen ohne Programmierkenntnisse.', 'FORMULARE', 'INFRASTRUKTUR_PLATTFORMEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '2.0.0', '#28A745', 'FD', 4.0, 6, 34, 'Formulare,Designer,Drag-and-Drop,No-Code', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('wb-foerderung', 'WB-Foerderung', 'Verwaltung der Weiterbildungsfoerderung fuer Aerzte', 'Umfassende Loesung fuer die Verwaltung von Weiterbildungsermaechtigungen, Foerderantraegen, Zueschuessen und Bescheiden.', 'VERWALTUNG', 'STEUERUNG_PRUEFSTELLEN', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '1.8.0', '#FF9868', 'WB', 4.5, 10, 41, 'Weiterbildung,Foerderung,Aerzte,Antraege', 'kostenlos', 'Portal 2.0+', false, false, '/wb-foerderung'),
('dokumentengenerator', 'Dokumentengenerator', 'Automatische Erstellung von Geschaeftsdokumenten', 'Template-basierte Dokumentenerstellung fuer Bescheide, Briefe und Berichte mit Serienbrieffunktion.', 'INTEGRATION', 'INFRASTRUKTUR_PLATTFORMEN', 'INTEGRATION', 'PLATFORM', 'Platform', '2.3.0', '#887D75', 'DG', 4.0, 5, 28, 'Dokumente,Templates,Serienbriefe,Automatisierung', 'kostenlos', 'Portal 2.0+', false, false, NULL),
('brain', 'br.AI.n', 'KI-Plattform fuer intelligente Datenanalyse', 'Enterprise-KI-Plattform mit vortrainierten Modellen fuer das Gesundheitswesen, NLP und Computer Vision.', 'INTEGRATION', 'INFRASTRUKTUR_PLATTFORMEN', 'INTEGRATION', 'PLATFORM', 'Platform', '1.2.0', '#461EBE', 'AI', 4.9, 14, 62, 'KI,ML,NLP,Datenanalyse', 'lizenzpflichtig', 'Portal 2.0+', true, true, NULL),
('epa-connector', 'ePA Connector', 'Anbindung an die elektronische Patientenakte', 'Standardisierte Schnittstelle zur elektronischen Patientenakte (ePA) gemaess gematik-Spezifikation.', 'INTEGRATION', 'LEISTUNGSERBRINGER', 'INTEGRATION', 'HEALTH_PORTAL', 'Health Portal', '1.0.0', '#28DCAA', 'eP', 4.3, 4, 19, 'ePA,gematik,Patientenakte,Integration', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL),
('forschungsdaten-hub', 'Forschungsdaten Hub', 'Pseudonymisierte Datenbereitstellung fuer Forschungszwecke', 'Plattform fuer die sichere Bereitstellung pseudonymisierter Gesundheitsdaten an Forschungseinrichtungen.', 'ANALYSE', 'OEFFENTLICHE_HAND_FORSCHUNG', 'ANWENDUNG', 'HEALTH_PORTAL', 'Health Portal', '1.1.0', '#76C800', 'FH', 4.2, 3, 12, 'Forschung,Pseudonymisierung,Daten,Open-Data', 'lizenzpflichtig', 'Portal 2.0+', false, true, NULL);
