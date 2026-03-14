-- =============================================================
-- V13: Sub-tasks (Unteraufgaben) + Posteingang Dashboard Widget
-- =============================================================

-- Add parent_id to nachricht_items for sub-task hierarchy
ALTER TABLE nachricht_items ADD COLUMN parent_id VARCHAR(50) REFERENCES nachricht_items(id) ON DELETE CASCADE;
CREATE INDEX idx_nachricht_items_parent ON nachricht_items(parent_id) WHERE parent_id IS NOT NULL;

-- Add Posteingang widget definition (scrollable inbox list)
INSERT INTO widget_definitionen (id, widget_key, titel, beschreibung, kategorie, widget_typ,
    standard_breite, standard_hoehe, min_breite, min_hoehe, max_breite, max_hoehe,
    daten_endpunkt, link_ziel)
VALUES ('wd-posteingang', 'portal.posteingang', 'Posteingang',
    'Scrollbare Liste mit offenen Aufgaben und Nachrichten aus dem Nachrichtencenter',
    'PORTAL', 'LISTE', 2, 2, 1, 1, 4, 4,
    '/api/nachricht/posteingang', '/nachrichten');
