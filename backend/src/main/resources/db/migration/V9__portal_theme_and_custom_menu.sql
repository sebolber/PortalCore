-- V9: Portal-Theme (Farben, Schriftart, Titel, Icon) und benutzerdefinierte Menuepunkte

-- Theme-Konfiguration pro Mandant (oder global wenn tenant_id NULL)
CREATE TABLE portal_theme (
    id              VARCHAR(50) PRIMARY KEY,
    tenant_id       VARCHAR(50) REFERENCES tenants(id),

    -- Portal-Identitaet
    portal_title    VARCHAR(200) DEFAULT 'Health Portal',
    portal_icon_initials VARCHAR(5) DEFAULT 'HP',
    portal_icon_url VARCHAR(500),

    -- Primaerfarben (4 Stufen)
    primary_color       VARCHAR(9) DEFAULT '#006EC7',
    primary_dark        VARCHAR(9) DEFAULT '#004F8F',
    primary_light       VARCHAR(9) DEFAULT '#EBF3FA',
    primary_contrast    VARCHAR(9) DEFAULT '#FFFFFF',

    -- Sekundaerfarben (4 Stufen)
    secondary_color     VARCHAR(9) DEFAULT '#461EBE',
    secondary_dark      VARCHAR(9) DEFAULT '#2E1480',
    secondary_light     VARCHAR(9) DEFAULT '#F0EAFB',
    secondary_contrast  VARCHAR(9) DEFAULT '#FFFFFF',

    -- Schrift
    font_family         VARCHAR(200) DEFAULT 'Fira Sans',
    font_family_heading VARCHAR(200) DEFAULT 'Fira Sans Condensed',
    font_color          VARCHAR(9) DEFAULT '#252220',
    font_color_light    VARCHAR(9) DEFAULT '#887D75',

    -- Metadaten
    last_modified   TIMESTAMP DEFAULT NOW(),
    last_modified_by VARCHAR(100),

    UNIQUE(tenant_id)
);

-- Standard-Theme (global)
INSERT INTO portal_theme (id, tenant_id, portal_title, portal_icon_initials) VALUES
('theme-global', NULL, 'Health Portal', 'HP');

-- Benutzerdefinierte Menuepunkte (iFrame-Einbindungen etc.)
CREATE TABLE custom_menu_items (
    id              VARCHAR(50) PRIMARY KEY,
    tenant_id       VARCHAR(50) REFERENCES tenants(id),
    parent_id       VARCHAR(50),           -- NULL = Hauptmenuepunkt, sonst Unterpunkt
    label           VARCHAR(200) NOT NULL,
    icon            VARCHAR(50) DEFAULT 'link',
    menu_type       VARCHAR(20) NOT NULL DEFAULT 'IFRAME',  -- IFRAME, LINK, SEPARATOR
    url             TEXT,                   -- URL fuer iFrame oder externen Link
    sort_order      INT DEFAULT 0,
    visible         BOOLEAN DEFAULT true,
    erstellt_am     TIMESTAMP DEFAULT NOW(),
    erstellt_von    VARCHAR(100)
);

-- Menue-Reihenfolge Konfiguration
CREATE TABLE menu_order_config (
    id              VARCHAR(50) PRIMARY KEY,
    tenant_id       VARCHAR(50) REFERENCES tenants(id),
    menu_item_key   VARCHAR(100) NOT NULL,  -- z.B. "dashboard", "nachrichten", "plattform.appstore"
    sort_order      INT NOT NULL DEFAULT 0,
    visible         BOOLEAN DEFAULT true,
    UNIQUE(tenant_id, menu_item_key)
);
