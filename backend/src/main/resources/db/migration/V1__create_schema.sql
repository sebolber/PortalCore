-- Health Portal - Database Schema

-- Tenants
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Portal Users
CREATE TABLE portal_users (
    id VARCHAR(50) PRIMARY KEY,
    vorname VARCHAR(100) NOT NULL,
    nachname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    iam_id VARCHAR(100),
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    status VARCHAR(20) NOT NULL DEFAULT 'AKTIV',
    letzter_login TIMESTAMP,
    erstellt_am TIMESTAMP DEFAULT NOW(),
    iam_sync BOOLEAN DEFAULT FALSE,
    initialen VARCHAR(10) NOT NULL,
    password_hash VARCHAR(255)
);

-- Roles
CREATE TABLE portal_rollen (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    hierarchie INT DEFAULT 0,
    scope VARCHAR(100) NOT NULL DEFAULT 'global',
    benutzer_anzahl INT DEFAULT 0,
    system_rolle BOOLEAN DEFAULT FALSE,
    farbe VARCHAR(20)
);

-- Permissions
CREATE TABLE berechtigungen (
    id VARCHAR(50) PRIMARY KEY,
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    typ VARCHAR(20) NOT NULL,
    app_id VARCHAR(50),
    app_name VARCHAR(100),
    gruppe VARCHAR(100)
);

-- User-Role join table
CREATE TABLE user_roles (
    user_id VARCHAR(50) NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES portal_rollen(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permission join table
CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES portal_rollen(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) NOT NULL REFERENCES berechtigungen(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Portal Apps (Catalog)
CREATE TABLE portal_apps (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_description VARCHAR(500),
    long_description TEXT,
    category VARCHAR(50) NOT NULL,
    market_segment VARCHAR(50) NOT NULL,
    app_type VARCHAR(20) NOT NULL,
    vendor VARCHAR(30) NOT NULL,
    vendor_name VARCHAR(100),
    version VARCHAR(20),
    icon_color VARCHAR(20),
    icon_initials VARCHAR(10),
    rating DOUBLE PRECISION DEFAULT 0,
    review_count INT DEFAULT 0,
    install_count INT DEFAULT 0,
    tags TEXT,
    price VARCHAR(30) NOT NULL DEFAULT 'kostenlos',
    compatibility TEXT,
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    route VARCHAR(100)
);

-- Installed Apps per Tenant
CREATE TABLE installed_apps (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    app_id VARCHAR(50) NOT NULL REFERENCES portal_apps(id),
    installed_at TIMESTAMP DEFAULT NOW(),
    installed_by VARCHAR(50),
    status VARCHAR(30) DEFAULT 'active',
    UNIQUE(tenant_id, app_id)
);

-- Messages
CREATE TABLE portal_messages (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    body TEXT,
    severity VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    sender VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    app_id VARCHAR(50),
    tenant_id VARCHAR(50) REFERENCES tenants(id)
);

-- Parameters
CREATE TABLE portal_parameters (
    id VARCHAR(50) PRIMARY KEY,
    param_key VARCHAR(150) NOT NULL,
    label VARCHAR(200) NOT NULL,
    description TEXT,
    app_id VARCHAR(50),
    app_name VARCHAR(100),
    param_group VARCHAR(100),
    type VARCHAR(20) NOT NULL,
    value TEXT,
    default_value TEXT,
    required BOOLEAN DEFAULT FALSE,
    validation_rules TEXT,
    options TEXT,
    unit VARCHAR(30),
    sensitive BOOLEAN DEFAULT FALSE,
    hot_reload BOOLEAN DEFAULT FALSE,
    last_modified TIMESTAMP,
    last_modified_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Aufgaben Gruppen
CREATE TABLE aufgaben_gruppen (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    mitglieder_ids TEXT
);

-- Aufgaben Zuweisungen
CREATE TABLE aufgaben_zuweisungen (
    id VARCHAR(50) PRIMARY KEY,
    bezeichnung VARCHAR(300) NOT NULL,
    kriterium VARCHAR(30) NOT NULL,
    kriterium_wert VARCHAR(200) NOT NULL,
    zuweisung_typ VARCHAR(20) NOT NULL,
    mitarbeiter_id VARCHAR(50),
    gruppe_id VARCHAR(50),
    produkt_id VARCHAR(50) NOT NULL,
    gueltig_von DATE,
    gueltig_bis DATE,
    prioritaet VARCHAR(20) NOT NULL,
    erstellt_am TIMESTAMP DEFAULT NOW(),
    erstellt_von VARCHAR(100),
    beschreibung TEXT
);

-- Batch Jobs
CREATE TABLE batch_jobs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    produkt_id VARCHAR(50),
    schedule VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    gestartet_um TIMESTAMP,
    beendet_um TIMESTAMP,
    naechster_lauf TIMESTAMP,
    dauer VARCHAR(50),
    fortschritt INT,
    protokoll TEXT
);

-- smile KH - Eingereichte Faelle
CREATE TABLE eingereichte_faelle (
    id VARCHAR(50) PRIMARY KEY,
    fall_nr VARCHAR(50) NOT NULL,
    patient VARCHAR(200) NOT NULL,
    krankenhaus VARCHAR(300) NOT NULL,
    drg_code VARCHAR(20),
    einreichungs_datum DATE,
    betrag DECIMAL(12,2),
    ampel VARCHAR(10) NOT NULL,
    ampel_grund TEXT
);

-- smile KH - Offene Rechnungen
CREATE TABLE offene_rechnungen (
    id VARCHAR(50) PRIMARY KEY,
    rechnungs_nr VARCHAR(50) NOT NULL,
    krankenhaus VARCHAR(300) NOT NULL,
    patient VARCHAR(200) NOT NULL,
    rechnungs_datum DATE,
    faelligkeits_datum DATE,
    betrag DECIMAL(12,2),
    bezahlt DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    tage_offen INT DEFAULT 0,
    bemerkung TEXT
);

-- Indexes
CREATE INDEX idx_portal_users_tenant ON portal_users(tenant_id);
CREATE INDEX idx_portal_users_status ON portal_users(status);
CREATE INDEX idx_portal_apps_category ON portal_apps(category);
CREATE INDEX idx_portal_apps_segment ON portal_apps(market_segment);
CREATE INDEX idx_installed_apps_tenant ON installed_apps(tenant_id);
CREATE INDEX idx_portal_messages_tenant ON portal_messages(tenant_id);
CREATE INDEX idx_portal_messages_read ON portal_messages(is_read);
CREATE INDEX idx_portal_parameters_app ON portal_parameters(app_id);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX idx_eingereichte_faelle_ampel ON eingereichte_faelle(ampel);
