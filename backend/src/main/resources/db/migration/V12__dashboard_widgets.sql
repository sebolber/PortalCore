-- =============================================================
-- V12: Configurable Dashboard with Widget System
-- =============================================================

-- Registry of available widget definitions (portal-wide + app-provided)
CREATE TABLE widget_definitionen (
    id VARCHAR(50) PRIMARY KEY,
    widget_key VARCHAR(100) NOT NULL UNIQUE,              -- e.g. 'portal.offene-aufgaben', 'smile-kh.fallstatus'
    titel VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    kategorie VARCHAR(50) NOT NULL,                       -- PORTAL, APP, QUICKLINK
    widget_typ VARCHAR(50) NOT NULL,                      -- ZAHL, TABELLE, TORTE, BALKEN, QUICKLINK, LISTE
    app_id VARCHAR(50),                                   -- NULL for portal widgets
    app_name VARCHAR(100),
    icon_path VARCHAR(200),
    standard_breite INT NOT NULL DEFAULT 1,               -- Default grid width (1-4)
    standard_hoehe INT NOT NULL DEFAULT 1,                -- Default grid height (1-4)
    min_breite INT NOT NULL DEFAULT 1,
    min_hoehe INT NOT NULL DEFAULT 1,
    max_breite INT NOT NULL DEFAULT 4,
    max_hoehe INT NOT NULL DEFAULT 4,
    daten_endpunkt VARCHAR(300),                          -- API endpoint for data
    link_ziel VARCHAR(300),                               -- Click target route
    konfigurierbar BOOLEAN NOT NULL DEFAULT FALSE,
    konfig_schema TEXT,                                    -- JSON schema for config options
    aktiv BOOLEAN NOT NULL DEFAULT TRUE,
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User-specific dashboard layout
CREATE TABLE dashboard_widgets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id),
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    widget_definition_id VARCHAR(50) NOT NULL REFERENCES widget_definitionen(id),
    position_x INT NOT NULL DEFAULT 0,                    -- Grid column (0-based)
    position_y INT NOT NULL DEFAULT 0,                    -- Grid row (0-based)
    breite INT NOT NULL DEFAULT 1,                        -- Widget width in grid units
    hoehe INT NOT NULL DEFAULT 1,                         -- Widget height in grid units
    konfiguration TEXT,                                    -- JSON config overrides
    sichtbar BOOLEAN NOT NULL DEFAULT TRUE,
    sortierung INT NOT NULL DEFAULT 0,
    erstellt_am TIMESTAMP NOT NULL DEFAULT NOW(),
    aktualisiert_am TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tenant_id, widget_definition_id)
);

-- Available pages/routes for quicklinks
CREATE TABLE portal_seiten (
    id VARCHAR(50) PRIMARY KEY,
    seiten_key VARCHAR(100) NOT NULL UNIQUE,              -- e.g. 'nachrichten', 'einstellungen'
    titel VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    route VARCHAR(300) NOT NULL,
    icon_path VARCHAR(200),
    kategorie VARCHAR(50) NOT NULL,                       -- PORTAL, APP
    app_id VARCHAR(50),
    aktiv BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_dashboard_widgets_user ON dashboard_widgets(user_id, tenant_id);
CREATE INDEX idx_widget_definitionen_kategorie ON widget_definitionen(kategorie);
CREATE INDEX idx_widget_definitionen_app ON widget_definitionen(app_id);
CREATE INDEX idx_portal_seiten_kategorie ON portal_seiten(kategorie);

-- Seed: Portal widget definitions
INSERT INTO widget_definitionen (id, widget_key, titel, beschreibung, kategorie, widget_typ, standard_breite, standard_hoehe, min_breite, min_hoehe, daten_endpunkt, link_ziel) VALUES
('wd-offene-aufgaben', 'portal.offene-aufgaben', 'Offene Aufgaben', 'Anzahl der offenen Aufgaben im Nachrichtencenter', 'PORTAL', 'ZAHL', 1, 1, 1, 1, '/api/nachricht/ungelesen-anzahl', '/nachrichten'),
('wd-ungelesene-nachrichten', 'portal.ungelesene-nachrichten', 'Ungelesene Nachrichten', 'Anzahl ungelesener Nachrichten', 'PORTAL', 'ZAHL', 1, 1, 1, 1, '/api/nachricht/ungelesen-anzahl', '/nachrichten'),
('wd-installierte-apps', 'portal.installierte-apps', 'Installierte Apps', 'Uebersicht der installierten Anwendungen', 'PORTAL', 'ZAHL', 1, 1, 1, 1, NULL, '/appstore/installiert'),
('wd-quicklink', 'portal.quicklink', 'Quicklink', 'Schnelleinstieg zu einer Portal- oder App-Seite', 'PORTAL', 'QUICKLINK', 1, 1, 1, 1, NULL, NULL),
('wd-willkommen', 'portal.willkommen', 'Willkommen', 'Begruessung mit Datum und Mandanteninfo', 'PORTAL', 'ZAHL', 4, 1, 2, 1, NULL, NULL),
('wd-letzte-apps', 'portal.letzte-apps', 'Zuletzt genutzte Apps', 'Kuerzlich verwendete Anwendungen', 'PORTAL', 'LISTE', 2, 1, 1, 1, NULL, '/appstore');

-- Seed: Portal pages for quicklinks
INSERT INTO portal_seiten (id, seiten_key, titel, beschreibung, route, kategorie) VALUES
('ps-dashboard', 'dashboard', 'Dashboard', 'Startseite des Portals', '/', 'PORTAL'),
('ps-nachrichten', 'nachrichten', 'Nachrichtencenter', 'Nachrichten und Aufgaben', '/nachrichten', 'PORTAL'),
('ps-appstore', 'appstore', 'AppStore', 'App-Marktplatz', '/appstore', 'PORTAL'),
('ps-installiert', 'installierte-apps', 'Installierte Apps', 'Uebersicht installierter Apps', '/appstore/installiert', 'PORTAL'),
('ps-parameter', 'parameter', 'Parameter', 'Systemparameter verwalten', '/parameter', 'PORTAL'),
('ps-benutzer', 'benutzer', 'Benutzer', 'Benutzerverwaltung', '/benutzer', 'PORTAL'),
('ps-gruppen', 'gruppen', 'Gruppen', 'Gruppenverwaltung', '/gruppen', 'PORTAL'),
('ps-mandanten', 'mandanten', 'Mandanten', 'Mandantenverwaltung', '/mandanten', 'PORTAL'),
('ps-aufgaben', 'aufgabensteuerung', 'Aufgabensteuerung', 'Aufgabenzuweisungsregeln', '/aufgaben', 'PORTAL'),
('ps-einstellungen', 'einstellungen', 'Einstellungen', 'Portaleinstellungen', '/einstellungen', 'PORTAL'),
('ps-batch', 'batch-jobs', 'Batch-Jobs', 'Batch-Verarbeitung', '/batch', 'PORTAL'),
('ps-cms', 'cms', 'CMS', 'Content Management', '/cms', 'PORTAL'),
('ps-formulare', 'formulare', 'Formulare', 'Formularverwaltung', '/formulare', 'PORTAL'),
('ps-ki-agenten', 'ki-agenten', 'KI-Agenten', 'KI-Agenten verwalten', '/ki-agenten', 'PORTAL');
