# Prompt: Neue App fuer das Health Portal entwickeln

> **Diese Datei ist die zentrale Anleitung fuer KI-Assistenten und Entwickler, die eine neue App erstellen, die im Health Portal ueber den App Store installierbar sein soll.**
> **Diese Datei muss bei jeder neuen Anforderung aktualisiert werden.**

---

## Letzte Aktualisierung

- **Datum:** 2026-03-13
- **Aenderungshistorie:**
  - 2026-03-13: Erstversion mit Menue-Konfiguration, AppParameter-Schema, Deployment-Manifest, und vollstaendiger Projektstruktur
  - 2026-03-13: App-uebergreifende Berechtigungen: Use Cases in portal-app.yaml, automatische Synchronisation bei Installation
  - 2026-03-13: Parameter-System: Audit-Log, Typ-Validierung, zeitliche Gueltigkeit (gueltig_von/gueltig_bis)
  - 2026-03-13: Parameter-Mandanten: Mandantenspezifische Parameter mit tenant_id, Mandanten-Isolation
  - 2026-03-13: Portal CSS-Variablen: Theme-Integration mit --portal-primary/secondary/font CSS Custom Properties

---

## 1. Zielsetzung

Du erstellst eine neue Anwendung (App), die im **Health Portal** ueber den integrierten **App Store** installiert und als Docker-Container automatisch deployed werden kann. Die App muss folgende Kriterien erfuellen:

1. **Eigenstaendiger Docker-Container** mit Spring Boot Backend + Angular Frontend + PostgreSQL Datenbank
2. **`portal-app.yaml`** Manifest im Repository-Root fuer automatisches Deployment
3. **`portal-app-menu.yaml`** Menue-Konfigurationsdatei im Repository-Root, damit das Portal die Seitenstruktur der App kennt
4. **`AppParameter`-Tabelle** in der eigenen Datenbank fuer fachliche Parameter, die vom Portal uebergreifend angezeigt werden koennen
5. **REST-API fuer Parameter und Menue** damit das Portal die Daten zur Laufzeit abrufen kann

---

## 2. Technologie-Stack

| Komponente   | Technologie                         | Version    |
|--------------|-------------------------------------|------------|
| Backend      | Spring Boot                         | 3.x        |
| Java         | OpenJDK                             | 21         |
| Frontend     | Angular (Standalone Components)     | 18+        |
| CSS          | Tailwind CSS                        | 3.x        |
| Datenbank    | PostgreSQL                          | 16+        |
| Build        | Maven (Backend), npm (Frontend)     | -          |
| Container    | Docker + Docker Compose             | -          |
| Schriftart   | Fira Sans / Fira Sans Condensed     | -          |
| Sprache UI   | Deutsch (de-DE)                     | -          |

---

## 3. Projekt-Struktur

```
meine-app/
├── portal-app.yaml              # Deployment-Manifest (Pflicht)
├── portal-app-menu.yaml         # Menue-Konfiguration (Pflicht)
├── docker-compose.yml           # Lokale Entwicklungsumgebung
├── Dockerfile                   # Multi-Stage Build (Pflicht)
├── backend/
│   ├── pom.xml
│   └── src/main/java/de/meineapp/
│       ├── MeineAppApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   └── CorsConfig.java
│       ├── controller/
│       │   ├── ParameterController.java   # /api/parameters (Pflicht)
│       │   ├── MenuController.java        # /api/menu (Pflicht)
│       │   └── ...                        # Fachliche Controller
│       ├── entity/
│       │   ├── AppParameter.java          # Parameter-Entity (Pflicht)
│       │   └── ...                        # Fachliche Entities
│       ├── repository/
│       │   ├── AppParameterRepository.java
│       │   └── ...
│       ├── service/
│       │   ├── ParameterService.java
│       │   └── ...
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__create_schema.sql
│               └── V2__create_app_parameter.sql  # Pflicht
├── frontend/
│   ├── package.json
│   ├── angular.json
│   ├── tailwind.config.ts
│   └── src/
│       ├── styles.scss
│       └── app/
│           ├── app.routes.ts
│           ├── app.component.ts
│           └── pages/
│               └── ...
└── README.md
```

---

## 4. portal-app.yaml -- Deployment-Manifest

Diese Datei liegt im Repository-Root und wird vom Portal beim Deployment automatisch gelesen.

```yaml
# Pflichtfelder
name: Meine Neue App
version: 1.0.0
port: 80                          # Port auf dem die App im Container lauscht

# Docker Image (Option 1: Pre-built, empfohlen fuer Produktion)
image: ghcr.io/meine-firma/meine-app:latest

# ODER Dockerfile (Option 2: Lokaler Build)
# dockerfile: Dockerfile

# Optionale Felder
description: Beschreibung der App
env:
  SPRING_DATASOURCE_URL: jdbc:postgresql://app-db:5432/meineapp
  SPRING_DATASOURCE_USERNAME: meineapp
  SPRING_DATASOURCE_PASSWORD: meineapp
  NODE_ENV: production
healthCheck: /api/actuator/health

# Use Cases (Berechtigungen) der App -- PFLICHT
# Diese werden beim Installieren automatisch im Portal-Berechtigungssystem registriert.
# Administratoren erhalten sofort volle Rechte (anzeigen/lesen/schreiben/loeschen).
# Andere Gruppen koennen die Rechte ueber die Gruppenverwaltung konfigurieren.
# Beim Deinstallieren werden die Berechtigungen automatisch entfernt.
useCases:
  - key: meine-app-dashboard          # Eindeutiger technischer Schluessel
    label: "Meine App - Dashboard"     # Anzeigename in der Gruppenverwaltung
    beschreibung: "Zugriff auf das Dashboard der App"
  - key: meine-app-verwaltung
    label: "Meine App - Verwaltung"
    beschreibung: "Verwaltungsfunktionen der App"
  - key: meine-app-berichte
    label: "Meine App - Berichte"
    beschreibung: "Berichtswesen und Auswertungen"

# App-Store Metadaten (ueberschreiben DB-Eintraege im Portal)
appStore:
  category: VERWALTUNG              # Siehe Abschnitt 5.1
  marketSegment: KOSTENTRAEGER      # Siehe Abschnitt 5.2
  appType: ANWENDUNG                # ANWENDUNG oder INTEGRATION
  vendor: DRITTANBIETER             # Siehe Abschnitt 5.3
  vendorName: Meine Firma GmbH
  iconColor: "#006EC7"              # Hex-Farbe fuer Avatar
  iconInitials: MA                  # 2 Buchstaben fuer Avatar
  price: kostenlos                  # kostenlos oder lizenzpflichtig
  tags: verwaltung,stammdaten       # Komma-separiert fuer Suche
```

---

## 5. Enum-Werte fuer App-Store-Registrierung

### 5.1 AppCategory

| Wert              | Beschreibung                    |
|-------------------|---------------------------------|
| `ABRECHNUNG`      | Abrechnungs-Apps                |
| `FALLMANAGEMENT`  | Fallmanagement-Apps             |
| `VERWALTUNG`      | Verwaltungs-Apps                |
| `KI_AGENTEN`      | KI-basierte Anwendungen         |
| `ANALYSE`         | Analyse- und Reporting-Apps     |
| `KOMMUNIKATION`   | Kommunikations-Apps             |
| `INTEGRATION`     | Integrations-/Schnittstellen    |
| `FORMULARE`       | Formular-basierte Apps          |

### 5.2 MarketSegment

| Wert                          | Beschreibung                      |
|-------------------------------|-----------------------------------|
| `STEUERUNG_PRUEFSTELLEN`      | Steuerung & Pruefstellen          |
| `KOSTENTRAEGER`               | Kostentraeger (Kassen)            |
| `ABRECHNUNGSDIENSTLEISTER`    | Abrechnungsdienstleister          |
| `LEISTUNGSERBRINGER`          | Leistungserbringer (Aerzte etc.)  |
| `INFRASTRUKTUR_PLATTFORMEN`   | Infrastruktur & Plattformen       |
| `OEFFENTLICHE_HAND_FORSCHUNG` | Oeffentliche Hand & Forschung     |

### 5.3 AppVendor

| Wert              | Beschreibung                    |
|-------------------|---------------------------------|
| `HEALTH_PORTAL`   | Vom Health Portal Team           |
| `PLATFORM`        | Plattform-Apps                   |
| `COMMUNITY`       | Community-Beitraege              |
| `DRITTANBIETER`   | Externe Anbieter                 |

---

## 6. portal-app-menu.yaml -- Menue-Konfiguration (PFLICHT)

Diese Datei beschreibt die Navigationsstruktur der App. Das Portal liest sie beim Deployment aus und erstellt die Menue-Eintraege in der Sidebar. **Ohne diese Datei wird die App nur als einzelner Eintrag ohne Unterseiten im Menue angezeigt.**

```yaml
# portal-app-menu.yaml
# Definiert die Menue-Struktur der App fuer die Portal-Sidebar

# Haupteintrag der App (wird automatisch aus portal-app.yaml ergaenzt)
menu:
  label: Meine App                  # Anzeigename im Menue
  icon: clipboard                   # Icon-Name (siehe Abschnitt 6.1)
  defaultRoute: /                   # Standard-Route beim Oeffnen

  # Unterseiten der App
  children:
    - id: dashboard
      label: Uebersicht
      route: /
      icon: home
      order: 1

    - id: stammdaten
      label: Stammdaten
      route: /stammdaten
      icon: database
      order: 2
      children:                      # Verschachtelte Untermenues moeglich
        - id: kunden
          label: Kunden
          route: /stammdaten/kunden
          order: 1
        - id: vertraege
          label: Vertraege
          route: /stammdaten/vertraege
          order: 2

    - id: auswertungen
      label: Auswertungen
      route: /auswertungen
      icon: chart-bar
      order: 3

    - id: einstellungen
      label: Einstellungen
      route: /einstellungen
      icon: settings
      order: 99
      requiredRole: admin            # Nur fuer Admins sichtbar
```

### 6.1 Verfuegbare Icon-Namen

Die folgenden Icon-Namen werden vom Portal unterstuetzt (SVG-basiert):

| Icon-Name      | Beschreibung         |
|----------------|----------------------|
| `home`         | Startseite           |
| `database`     | Datenbank/Stammdaten |
| `chart-bar`    | Diagramm/Auswertung  |
| `settings`     | Einstellungen        |
| `users`        | Benutzer             |
| `clipboard`    | Zwischenablage       |
| `document`     | Dokument             |
| `folder`       | Ordner               |
| `search`       | Suche                |
| `bell`         | Benachrichtigung     |
| `calendar`     | Kalender             |
| `mail`         | Nachricht            |
| `shield`       | Sicherheit           |
| `link`         | Verknuepfung         |
| `upload`       | Upload               |
| `download`     | Download             |

### 6.2 Menue-Endpunkt (Pflicht)

Die App muss einen REST-Endpunkt bereitstellen, ueber den das Portal die Menue-Struktur zur Laufzeit abrufen kann:

```
GET /api/menu
```

**Response:**

```json
{
  "label": "Meine App",
  "icon": "clipboard",
  "defaultRoute": "/",
  "children": [
    {
      "id": "dashboard",
      "label": "Uebersicht",
      "route": "/",
      "icon": "home",
      "order": 1,
      "children": []
    },
    {
      "id": "stammdaten",
      "label": "Stammdaten",
      "route": "/stammdaten",
      "icon": "database",
      "order": 2,
      "children": [
        {
          "id": "kunden",
          "label": "Kunden",
          "route": "/stammdaten/kunden",
          "order": 1,
          "children": []
        }
      ]
    }
  ]
}
```

**Spring Boot Implementation:**

```java
@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @GetMapping
    public MenuStructure getMenu() {
        // Liest portal-app-menu.yaml und gibt die Struktur zurueck
        // Alternativ: Hartcodiert oder aus Datenbank
    }
}

// DTOs
@Data
public class MenuStructure {
    private String label;
    private String icon;
    private String defaultRoute;
    private List<MenuItem> children;
}

@Data
public class MenuItem {
    private String id;
    private String label;
    private String route;
    private String icon;
    private int order;
    private String requiredRole;
    private List<MenuItem> children = new ArrayList<>();
}
```

---

## 7. AppParameter-Tabelle (PFLICHT)

Jede App muss fachliche Konfigurationsparameter in einer standardisierten Tabelle `app_parameter` speichern. Das Portal kann diese Parameter ueber einen uebergreifenden Dialog anzeigen und bearbeiten.

### 7.1 Datenbank-Schema

```sql
-- V2__create_app_parameter.sql (Flyway-Migration)
CREATE TABLE app_parameter (
    id              VARCHAR(100) PRIMARY KEY,
    param_key       VARCHAR(200) NOT NULL UNIQUE,  -- Technischer Schluessel (z.B. "abrechnung.mwst.satz")
    label           VARCHAR(200) NOT NULL,         -- Anzeigename
    description     TEXT,                          -- Beschreibung / Hilfetext
    app_id          VARCHAR(50) NOT NULL,          -- ID der App (z.B. "meine-app")
    app_name        VARCHAR(100) NOT NULL,         -- Anzeigename der App
    param_group     VARCHAR(100) NOT NULL,         -- Gruppierung (z.B. "Allgemein", "Abrechnung")
    param_type      VARCHAR(50) NOT NULL,          -- Datentyp (siehe 7.2)
    param_value     TEXT,                          -- Aktueller Wert
    default_value   TEXT,                          -- Standard-Wert
    required        BOOLEAN DEFAULT false,         -- Pflichtfeld?
    validation_rules VARCHAR(500),                 -- Validierungsregel (Regex oder JSON-Schema)
    options         TEXT,                           -- Komma-separierte Optionen fuer SELECT-Typ
    unit            VARCHAR(50),                   -- Einheit (z.B. "min", "Tage", "%", "EUR")
    sensitive       BOOLEAN DEFAULT false,         -- Sensible Daten (werden maskiert angezeigt)
    hot_reload      BOOLEAN DEFAULT false,         -- Kann zur Laufzeit geaendert werden?
    last_modified   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100),                 -- Wer hat zuletzt geaendert?
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gueltig_von     TIMESTAMP DEFAULT '1970-01-01 00:00:00',  -- Zeitliche Gueltigkeit: Beginn
    gueltig_bis     TIMESTAMP DEFAULT '9999-12-31 23:59:59', -- Zeitliche Gueltigkeit: Ende
    tenant_id       VARCHAR(50),                   -- Mandanten-ID (NULL = globaler Parameter fuer alle Mandanten)
    CONSTRAINT fk_param_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Index fuer schnelle Mandanten-Abfragen
CREATE INDEX idx_app_parameter_tenant ON app_parameter(tenant_id);

-- Audit-Log fuer Parameteraenderungen (PFLICHT)
CREATE TABLE parameter_audit_log (
    id              VARCHAR(50) PRIMARY KEY,
    parameter_id    VARCHAR(100) NOT NULL,
    param_key       VARCHAR(200) NOT NULL,
    app_id          VARCHAR(50),
    app_name        VARCHAR(100),
    alter_wert      TEXT,                          -- Vorheriger Wert (bei sensiblen Parametern: "***")
    neuer_wert      TEXT,                          -- Neuer Wert (bei sensiblen Parametern: "***")
    geaendert_von   VARCHAR(100) NOT NULL,         -- E-Mail oder Name des Benutzers
    geaendert_am    TIMESTAMP NOT NULL DEFAULT NOW(),
    grund           TEXT,                          -- Optionaler Aenderungsgrund
    tenant_id       VARCHAR(50)                    -- Mandanten-ID (NULL = globaler Parameter)
);

-- Beispiel-Daten
INSERT INTO app_parameter (id, param_key, label, description, app_id, app_name, param_group, param_type, param_value, default_value, required, sensitive, hot_reload) VALUES
('param-001', 'app.name', 'Anwendungsname', 'Name der Anwendung', 'meine-app', 'Meine App', 'Allgemein', 'STRING', 'Meine App', 'Meine App', true, false, false),
('param-002', 'app.pagination.pageSize', 'Max. Ergebnisse pro Seite', 'Maximale Anzahl Ergebnisse in Listenansichten', 'meine-app', 'Meine App', 'Allgemein', 'NUMBER', '25', '25', false, false, true),
('param-003', 'abrechnung.mwst.satz', 'MwSt-Satz', 'Standard Mehrwertsteuersatz', 'meine-app', 'Meine App', 'Abrechnung', 'NUMBER', '19.0', '19.0', true, false, false),
('param-004', 'abrechnung.waehrung', 'Waehrung', 'Standard-Waehrung', 'meine-app', 'Meine App', 'Abrechnung', 'SELECT', 'EUR', 'EUR', true, false, false),
('param-005', 'notification.email.enabled', 'E-Mail Benachrichtigungen', 'E-Mail Benachrichtigungen aktivieren', 'meine-app', 'Meine App', 'Benachrichtigungen', 'BOOLEAN', 'true', 'true', false, false, true);
```

### 7.2 Parameter-Typen

Das Portal validiert Werte automatisch anhand des Typs. Die App muss denselben Typ verwenden.

| Typ         | Beschreibung                        | Beispielwert           | Validierung                          |
|-------------|-------------------------------------|------------------------|--------------------------------------|
| `STRING`    | Freitext                            | `"Mein Wert"`          | Keine                                |
| `NUMBER`    | Zahl (Ganz- oder Dezimalzahl)       | `"42"` oder `"19.5"`   | Muss als Double parsebar sein        |
| `BOOLEAN`   | Wahrheitswert                       | `"true"` / `"false"`   | Nur `"true"` oder `"false"`          |
| `DATE`      | Datum (ISO 8601)                    | `"2026-01-15"`         | Format: `YYYY-MM-DD`                |
| `SELECT`    | Auswahl aus Optionsliste            | `"EUR"`                | Wert muss in `options` enthalten sein |
| `PASSWORD`  | Sensibles Passwort                  | `"***"`                | Keine (wird maskiert angezeigt)      |
| `EMAIL`     | E-Mail-Adresse                      | `"test@example.com"`   | Regex-Validierung E-Mail-Format      |
| `URL`       | URL                                 | `"https://example.com"`| Muss mit `http://` oder `https://` beginnen |
| `TEXTAREA`  | Mehrzeiliger Freitext               | `"Zeile 1\nZeile 2"`  | Keine                                |

> **Wichtig:** Die Typen `INTEGER`, `DECIMAL`, `DATETIME`, `MULTISELECT` und `JSON` aus frueheren Versionen wurden durch die obigen Typen ersetzt. `NUMBER` ersetzt `INTEGER` und `DECIMAL`.

### 7.3 Parameter-Entity (Spring Boot)

```java
@Entity
@Table(name = "app_parameter")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppParameter {

    @Id
    private String id;

    @Column(name = "param_key", nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "app_id", nullable = false)
    private String appId;

    @Column(name = "app_name", nullable = false)
    private String appName;

    @Column(name = "param_group", nullable = false)
    private String group;

    @Column(name = "param_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ParameterType type;  // STRING, NUMBER, BOOLEAN, EMAIL, URL, SELECT, DATE, PASSWORD, TEXTAREA

    @Column(name = "param_value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(nullable = false)
    private boolean required;

    @Column(name = "validation_rules")
    private String validationRules;

    private String options;  // Komma-separierte Optionen fuer SELECT

    private String unit;

    @Column(nullable = false)
    private boolean sensitive;

    @Column(name = "hot_reload", nullable = false)
    private boolean hotReload;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "gueltig_von")
    private LocalDateTime gueltigVon;

    @Column(name = "gueltig_bis")
    private LocalDateTime gueltigBis;

    @Column(name = "tenant_id")
    private String tenantId;  // NULL = globaler Parameter fuer alle Mandanten

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        lastModified = LocalDateTime.now();
        if (gueltigVon == null) gueltigVon = LocalDateTime.of(1970, 1, 1, 0, 0);
        if (gueltigBis == null) gueltigBis = LocalDateTime.of(9999, 12, 31, 23, 59, 59);
    }
}
```

### 7.4 Audit-Log Entity

Jede Parameteraenderung muss in einem Audit-Log protokolliert werden:

```java
@Entity
@Table(name = "parameter_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParameterAuditLog {

    @Id
    private String id;

    @Column(name = "parameter_id", nullable = false)
    private String parameterId;

    @Column(name = "param_key", nullable = false)
    private String paramKey;

    @Column(name = "app_id")
    private String appId;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "alter_wert", columnDefinition = "TEXT")
    private String alterWert;   // Bei sensiblen Parametern: "***"

    @Column(name = "neuer_wert", columnDefinition = "TEXT")
    private String neuerWert;   // Bei sensiblen Parametern: "***"

    @Column(name = "geaendert_von", nullable = false)
    private String geaendertVon;

    @Column(name = "geaendert_am", nullable = false)
    private LocalDateTime geaendertAm;

    @Column(columnDefinition = "TEXT")
    private String grund;
}
```

### 7.5 Parameter-REST-API (Pflicht)

Die App muss folgende Endpunkte bereitstellen:

```
GET    /api/parameters                    -- Alle Parameter auflisten (optional: ?appId=xxx)
GET    /api/parameters/{id}               -- Einzelnen Parameter abrufen
POST   /api/parameters                    -- Neuen Parameter erstellen
PUT    /api/parameters/{id}               -- Parameter vollstaendig aktualisieren
PATCH  /api/parameters/{id}/value         -- Nur den Wert aendern (mit Audit-Log)
PATCH  /api/parameters/{id}/reset         -- Parameter auf Standardwert zuruecksetzen
DELETE /api/parameters/{id}               -- Parameter loeschen
GET    /api/parameters/audit-log          -- Audit-Log abrufen (optional: ?appId=xxx&parameterId=xxx)
```

**PATCH /value Request-Body:**

```json
{
  "value": "neuer_wert",
  "grund": "Begruendung fuer die Aenderung"
}
```

Das Portal validiert den Wert automatisch anhand des Parameter-Typs und schreibt bei jeder Aenderung einen Eintrag in den Audit-Log.

**Controller-Beispiel:**

```java
@RestController
@RequestMapping("/api/parameters")
public class ParameterController {

    private final ParameterService parameterService;

    public ParameterController(ParameterService parameterService) {
        this.parameterService = parameterService;
    }

    @GetMapping
    public List<AppParameter> getAll(@RequestParam(required = false) String appId) {
        if (appId != null) {
            return parameterService.findByAppId(appId);
        }
        return parameterService.findAll();
    }

    @GetMapping("/{id}")
    public AppParameter getById(@PathVariable String id) {
        return parameterService.findById(id);
    }

    @PatchMapping("/{id}/value")
    public ResponseEntity<?> updateValue(@PathVariable String id, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        String grund = body.getOrDefault("grund", "");
        String modifiedBy = getCurrentUserEmail(); // Aus JWT-Token
        try {
            AppParameter updated = parameterService.updateValue(id, value, modifiedBy, grund);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reset")
    public AppParameter resetToDefault(@PathVariable String id) {
        return parameterService.resetToDefault(id);
    }

    @GetMapping("/audit-log")
    public List<ParameterAuditLog> getAuditLog(
            @RequestParam(required = false) String appId,
            @RequestParam(required = false) String parameterId) {
        // Gibt Audit-Log zurueck, sortiert nach geaendert_am absteigend
        return parameterService.getAuditLog(appId, parameterId);
    }
}
```

### 7.6 Zeitliche Gueltigkeit

Parameter haben eine optionale zeitliche Gueltigkeit (`gueltig_von` / `gueltig_bis`):

- **Standard:** Parameter sind "immer gueltig" (von 1970-01-01 bis 9999-12-31)
- **Zeitlich begrenzt:** Administratoren koennen Start- und Enddatum setzen
- **Abgelaufene Parameter** werden im Portal mit einem Hinweis angezeigt
- **Noch nicht gueltige Parameter** werden ebenfalls markiert

### 7.7 Audit-Log Anforderungen

Jede Wertaenderung eines Parameters MUSS protokolliert werden:

1. **Wer** hat geaendert (E-Mail oder Name des Benutzers)
2. **Wann** wurde geaendert (Zeitstempel)
3. **Was** wurde geaendert (alter Wert -> neuer Wert)
4. **Warum** wurde geaendert (optionaler Grund)
5. Bei **sensiblen Parametern** werden alter und neuer Wert als `"***"` gespeichert

### 7.8 Mandantenspezifische Parameter

Parameter koennen mandantenspezifisch oder global sein:

- **`tenant_id = NULL`**: Globaler Parameter, gilt fuer alle Mandanten
- **`tenant_id = 't-aok-nw'`**: Parameter gilt nur fuer den Mandanten "AOK Nordwest"

**Sichtbarkeitsregeln:**

| Benutzertyp | Sichtbare Parameter |
|-------------|---------------------|
| Normaler Benutzer | Globale Parameter + Parameter des eigenen Mandanten |
| Mandanten-Admin | Globale Parameter + Parameter des eigenen Mandanten |
| Super-Admin | Alle Parameter aller Mandanten |

**Zugriffsschutz:**
- Ein Mandant kann **niemals** die mandantenspezifischen Parameter eines anderen Mandanten sehen oder bearbeiten
- Globale Parameter sind fuer alle sichtbar, aber nur von Administratoren editierbar
- Der Super-Admin (`super_admin = true`) sieht alle Parameter uebergreifend

**Repository-Abfragen:**
```java
// Parameter fuer einen Mandanten: eigene + globale
@Query("SELECT p FROM AppParameter p WHERE p.tenantId = :tenantId OR p.tenantId IS NULL")
List<AppParameter> findByTenantIdOrGlobal(@Param("tenantId") String tenantId);
```

---

## 8. Dockerfile (Multi-Stage Build)

```dockerfile
# ---- Build Backend ----
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn package -DskipTests -B

# ---- Build Frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build -- --configuration production

# ---- Runtime ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Backend JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Frontend Build (served by Spring Boot or Nginx)
COPY --from=frontend-build /app/frontend/dist/*/browser/ /app/static/

# Manifest und Menue-Konfiguration ins Image kopieren
COPY portal-app.yaml /app/portal-app.yaml
COPY portal-app-menu.yaml /app/portal-app-menu.yaml

EXPOSE 80

ENV SERVER_PORT=80
ENV SPRING_RESOURCES_STATIC_LOCATIONS=classpath:/static/,file:/app/static/

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 9. docker-compose.yml (Lokale Entwicklung)

```yaml
version: '3.8'

services:
  app-db:
    image: postgres:16-alpine
    container_name: meineapp-db
    environment:
      POSTGRES_DB: meineapp
      POSTGRES_USER: meineapp
      POSTGRES_PASSWORD: meineapp
    ports:
      - "5433:5432"           # Nicht 5432 um Konflikte mit Portal-DB zu vermeiden
    volumes:
      - app-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meineapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  app-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: meineapp-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://app-db:5432/meineapp
      SPRING_DATASOURCE_USERNAME: meineapp
      SPRING_DATASOURCE_PASSWORD: meineapp
      SERVER_PORT: 80
    ports:
      - "4300:80"
    depends_on:
      app-db:
        condition: service_healthy

volumes:
  app-data:
```

---

## 10. Backend-Konfiguration

### 10.1 application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:meineapp}
    username: ${DB_USER:meineapp}
    password: ${DB_PASS:meineapp}
  jpa:
    hibernate:
      ddl-auto: validate           # Schema wird durch Flyway verwaltet
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true

server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /                # Kein /api Prefix -- Controller definieren eigene Pfade

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

### 10.2 SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll()      // Statische Dateien erlauben
            );
        return http.build();
    }
}
```

### 10.3 CorsConfig.java

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));        // Portal darf zugreifen
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

## 11. Frontend-Anforderungen

### 11.1 Design-System

Die App muss das Portal-Design-System einhalten:

| Eigenschaft       | Wert                                    |
|-------------------|-----------------------------------------|
| Primary Color     | `#006EC7`                               |
| Schriftart        | `Fira Sans`, `Fira Sans Condensed`      |
| Border Radius     | `rounded-lg` (8px)                      |
| Shadow            | `shadow-sm` bis `shadow-md`             |
| Karten            | `.card` Klasse oder `bg-white rounded-lg shadow-sm border border-gray-200 p-6` |
| Buttons           | `.btn-primary` oder `bg-[#006EC7] text-white px-4 py-2 rounded-lg` |
| Dark Mode         | `dark:` Prefix-Klassen beruecksichtigen |

### 11.2 Responsive Design (Mobile-First)

| Breakpoint | Mindestbreite | Verwendung         |
|------------|---------------|---------------------|
| (default)  | 0px           | Mobile (iPhone)     |
| `sm:`      | 640px         | Kleine Tablets      |
| `md:`      | 768px         | Tablets             |
| `lg:`      | 1024px        | Desktop             |
| `xl:`      | 1280px        | Grosse Bildschirme  |

**Regeln:**
- Standard-Layout ist fuer Mobile optimiert
- Grids starten einspaltig: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Tabellen benoetigen `overflow-x-auto`
- Schriftart muss `Fira Sans` sein

### 11.3 Angular Standalone Components

```typescript
@Component({
  selector: 'app-meine-seite',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-4 sm:p-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900"
          style="font-family: 'Fira Sans Condensed', sans-serif">
        Seitentitel
      </h1>
      <!-- Inhalt -->
    </div>
  `
})
export class MeineSeiteComponent {
  // Angular Signals fuer State Management (kein RxJS fuer lokalen State)
}
```

### 11.4 Routing

```typescript
export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'stammdaten', component: StammdatenComponent },
  { path: 'stammdaten/kunden', component: KundenComponent },
  { path: 'stammdaten/vertraege', component: VertraegeComponent },
  { path: 'auswertungen', component: AuswertungenComponent },
  { path: 'einstellungen', component: EinstellungenComponent },
  { path: '**', redirectTo: '' }
];
```

> **Wichtig:** Die Routen muessen exakt mit den `route`-Eintraegen in `portal-app-menu.yaml` uebereinstimmen.

---

## 12. Integration mit dem Portal

### 12.1 Wie das Portal die App einbindet

Wenn ein Benutzer die App im App Store installiert und deployed:

1. **Portal klont das Repository** und liest `portal-app.yaml`
2. **Docker Image wird gebaut/gezogen** und Container gestartet
3. **Portal liest `portal-app-menu.yaml`** aus dem Repository (oder ruft `GET /api/menu` am laufenden Container ab)
4. **Sidebar wird aktualisiert:** Die App erscheint unter "Installierte Anwendungen" mit Unterseiten
5. **Klick auf Menuepunkt** oeffnet die App-URL mit dem entsprechenden Route-Suffix in einem iFrame oder neuen Tab

### 12.2 Menue-Integration im Detail

Das Portal baut den Sidebar-Eintrag wie folgt auf:

```
Installierte Anwendungen
├── Meine App                          ← Haupteintrag (aus portal-app-menu.yaml)
│   ├── Uebersicht                     ← /
│   ├── Stammdaten                     ← /stammdaten
│   │   ├── Kunden                     ← /stammdaten/kunden
│   │   └── Vertraege                  ← /stammdaten/vertraege
│   ├── Auswertungen                   ← /auswertungen
│   └── Einstellungen (nur Admin)      ← /einstellungen
```

Die vollstaendige URL wird zusammengesetzt aus:
```
{containerUrl}:{containerPort}{route}
z.B.: http://localhost:49001/stammdaten/kunden
```

### 12.3 Parameter-Integration

Das Portal ruft `GET /api/parameters` am App-Container ab und zeigt alle Parameter im uebergreifenden Parameter-Dialog an. Die Kategorien werden als Tabs oder Sektionen dargestellt:

```
Uebergreifender Parameter-Dialog
├── Tab: Meine App
│   ├── Kategorie: Allgemein
│   │   ├── Anwendungsname: "Meine App" (nicht editierbar)
│   │   └── Max. Ergebnisse: 25
│   ├── Kategorie: Abrechnung
│   │   ├── MwSt-Satz: 19.0%
│   │   └── Waehrung: EUR
│   └── Kategorie: Benachrichtigungen
│       └── E-Mail aktiv: ja
├── Tab: Andere App 1
│   └── ...
```

---

## 12.5 Portal CSS-Variablen -- Theme-Integration (PFLICHT)

Das Portal stellt ein einheitliches CSS-Variablen-System bereit, das alle eingebetteten Apps uebernehmen muessen. Dadurch passt sich das Erscheinungsbild der App automatisch an die Portal-Konfiguration an (Farben, Schrift, Branding).

### Verfuegbare CSS-Variablen

Die folgenden Variablen werden vom Portal auf `:root` gesetzt und koennen in jeder App per `var(--variable)` verwendet werden:

| Variable | Beschreibung | Standard |
|---|---|---|
| `--portal-primary` | Primaerfarbe | `#006EC7` |
| `--portal-primary-dark` | Primaerfarbe dunkel | `#004F8F` |
| `--portal-primary-light` | Primaerfarbe hell | `#EBF3FA` |
| `--portal-primary-contrast` | Kontrastfarbe zu Primaer | `#FFFFFF` |
| `--portal-secondary` | Sekundaerfarbe | `#461EBE` |
| `--portal-secondary-dark` | Sekundaerfarbe dunkel | `#2E1480` |
| `--portal-secondary-light` | Sekundaerfarbe hell | `#F0EAFB` |
| `--portal-secondary-contrast` | Kontrastfarbe zu Sekundaer | `#FFFFFF` |
| `--portal-font-family` | Schriftart fuer Fliesstext | `'Fira Sans', sans-serif` |
| `--portal-font-family-heading` | Schriftart fuer Ueberschriften | `'Fira Sans Condensed', sans-serif` |
| `--portal-font-color` | Standard-Schriftfarbe | `#252220` |
| `--portal-font-color-light` | Helle Schriftfarbe (Sekundaertext) | `#887D75` |

### Verwendung in der App

```css
/* In styles.scss oder Component-Styles */
.btn-primary {
  background-color: var(--portal-primary);
  color: var(--portal-primary-contrast);
}
.btn-primary:hover {
  background-color: var(--portal-primary-dark);
}
body {
  font-family: var(--portal-font-family);
  color: var(--portal-font-color);
}
h1, h2, h3 {
  font-family: var(--portal-font-family-heading);
}
```

### Fallback-Werte

Wenn die App auch standalone (ohne Portal) laufen soll, muessen Fallback-Werte definiert werden:

```css
:root {
  --portal-primary: #006EC7;
  --portal-primary-dark: #004F8F;
  --portal-primary-light: #EBF3FA;
  --portal-primary-contrast: #FFFFFF;
  --portal-secondary: #461EBE;
  --portal-secondary-dark: #2E1480;
  --portal-secondary-light: #F0EAFB;
  --portal-secondary-contrast: #FFFFFF;
  --portal-font-family: 'Fira Sans', sans-serif;
  --portal-font-family-heading: 'Fira Sans Condensed', sans-serif;
  --portal-font-color: #252220;
  --portal-font-color-light: #887D75;
}
```

### Regeln

1. **KEINE hardcodierten Farbwerte** fuer Primaer-/Sekundaerfarben verwenden -- immer CSS-Variablen nutzen
2. **Schriftarten** muessen ueber `--portal-font-family` und `--portal-font-family-heading` gesetzt werden
3. **Tailwind-Klassen** wie `bg-primary` oder `text-primary` duerfen weiterhin genutzt werden, aber die Tailwind-Config muss die CSS-Variablen referenzieren
4. Bei iFrame-Einbindung werden die Variablen vom Portal per `postMessage` an die App weitergegeben (zukuenftige Erweiterung)

---

## 13. App-uebergreifende Berechtigungen (PFLICHT)

### 13.1 Konzept

Das Portal verfuegt ueber ein zentrales Berechtigungssystem mit feingranularen Gruppenberechtigungen. Jede installierte App muss ihre **Use Cases** (Anwendungsfaelle) beim Portal registrieren, damit:

1. **Administratoren** automatisch volle Rechte auf alle App-Use-Cases erhalten
2. **Andere Gruppen** die Rechte pro Use Case konfigurieren koennen (anzeigen/lesen/schreiben/loeschen)
3. **Menuepunkte** automatisch ausgeblendet werden, wenn ein Benutzer keine `anzeigen`-Berechtigung hat
4. Beim **Deinstallieren** alle zugehoerigen Berechtigungen automatisch entfernt werden

### 13.2 Use Cases in portal-app.yaml definieren

Jede App muss ihre Use Cases im `portal-app.yaml` Manifest deklarieren:

```yaml
useCases:
  - key: meine-app-dashboard          # Eindeutig, Prefix mit App-Name empfohlen
    label: "Meine App - Dashboard"     # Anzeigename in der Portal-Gruppenverwaltung
    beschreibung: "Zugriff auf das Dashboard der App"
  - key: meine-app-stammdaten
    label: "Meine App - Stammdaten"
    beschreibung: "Verwaltung von Stammdaten"
```

**Regeln fuer Use-Case-Keys:**
- Prefix mit App-Name oder App-ID verwenden (`meine-app-...`)
- Nur Kleinbuchstaben, Bindestriche, keine Leerzeichen
- Muss innerhalb der App eindeutig sein
- Sollte den fachlichen Anwendungsfall beschreiben

### 13.3 Berechtigungspruefung in der App implementieren

Die App muss die Portal-Berechtigungen in ihren eigenen Endpunkten pruefen. Dazu leitet das Portal den JWT-Token an die App weiter.

**Variante 1: Portal-API abfragen (empfohlen)**

```java
@Service
public class PortalBerechtigungService {

    @Value("${portal.api.url:http://portal-backend:8080/api}")
    private String portalApiUrl;

    private final RestTemplate restTemplate;

    /**
     * Prueft ob der aktuelle Benutzer eine Berechtigung hat.
     * Der JWT-Token wird vom Portal-Request durchgereicht.
     */
    public boolean hatBerechtigung(String token, String useCase, String typ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                portalApiUrl + "/auth/me",
                HttpMethod.GET, entity, Map.class);

            if (response.getBody() == null) return false;

            List<Map<String, Object>> berechtigungen =
                (List<Map<String, Object>>) response.getBody().get("berechtigungen");

            return berechtigungen.stream()
                .filter(b -> useCase.equals(b.get("useCase")))
                .anyMatch(b -> Boolean.TRUE.equals(b.get(typ)));
        } catch (Exception e) {
            return false;
        }
    }
}
```

**Variante 2: JWT-Claims direkt auswerten**

```java
// Der Portal-JWT enthaelt: userId, tenantId, sessionId, email
// Die Berechtigungen muessen separat vom Portal abgefragt werden,
// da sie nicht im Token enthalten sind (Token waere zu gross).
```

### 13.4 Berechtigungsarten

Jeder Use Case hat vier Berechtigungsstufen:

| Recht       | Beschreibung                                       |
|-------------|-----------------------------------------------------|
| `anzeigen`  | Menuepunkt/Dialog ist sichtbar                      |
| `lesen`     | Daten duerfen gelesen werden                        |
| `schreiben` | Daten duerfen erstellt und bearbeitet werden         |
| `loeschen`  | Daten duerfen geloescht werden                       |

Wenn `anzeigen` deaktiviert ist, sieht der Benutzer den Use Case und den zugehoerigen Menuepunkt gar nicht.

### 13.5 App-Installation Berechtigungsfluss

```
1. Admin klickt "Installieren" im App Store
   └── Nur Benutzer mit Berechtigung "appstore-admin" (schreiben) koennen installieren
       Alle anderen Benutzer koennen den App Store nur durchstoebbern

2. Portal liest portal-app.yaml → useCases
   └── Use Cases werden in Tabelle "app_use_cases" registriert

3. Admin-Gruppe (g-admin) erhaelt automatisch volle Rechte
   └── Fuer jeden Use Case: anzeigen=true, lesen=true, schreiben=true, loeschen=true

4. Andere Gruppen koennen manuell konfiguriert werden
   └── In der Gruppenverwaltung: Use Cases der App erscheinen mit "App: app-id" Badge

5. Beim Deinstallieren
   └── Alle Berechtigungen mit app_id der App werden aus ALLEN Gruppen entfernt
   └── Registrierte Use Cases werden aus app_use_cases entfernt
```

### 13.6 Mandantenspezifische Berechtigungen

- Jeder Mandant kann eigene Gruppen erstellen und die Berechtigungen individuell konfigurieren
- Es gibt einen **Mandanten-Administrator** pro Mandant (Gruppe "Administration" mit Mandant-Zuordnung)
- Es gibt einen **Super-Administrator** (mandantenuebergreifend, Flag `super_admin` auf dem Benutzer)
- Der Super-Administrator kann Apps fuer alle Mandanten installieren und Mandantenzuordnungen verwalten

### 13.7 REST-API fuer Use-Case-Registrierung (alternativ zu Manifest)

Apps koennen ihre Use Cases auch zur Laufzeit ueber die Portal-API registrieren:

```
GET    /api/apps/{appId}/use-cases          -- Registrierte Use Cases abrufen
POST   /api/apps/{appId}/use-cases          -- Neuen Use Case registrieren
DELETE /api/apps/{appId}/use-cases/{id}     -- Use Case entfernen
```

**Request-Body (POST):**
```json
{
  "useCase": "meine-app-berichte",
  "useCaseLabel": "Meine App - Berichte",
  "beschreibung": "Zugriff auf Berichtswesen"
}
```

---

## 14. Checkliste fuer neue Apps

### Pflicht -- ohne diese Punkte ist die App nicht installierbar

- [ ] `portal-app.yaml` im Repository-Root vorhanden
- [ ] `portal-app-menu.yaml` im Repository-Root vorhanden
- [ ] `Dockerfile` im Repository-Root (Multi-Stage Build)
- [ ] `app_parameter` Tabelle per Flyway-Migration angelegt (inkl. gueltig_von/gueltig_bis)
- [ ] `parameter_audit_log` Tabelle per Flyway-Migration angelegt
- [ ] `GET /api/parameters` Endpunkt liefert alle Parameter
- [ ] `PATCH /api/parameters/{id}/value` schreibt Audit-Log und validiert nach Typ
- [ ] `GET /api/parameters/audit-log` liefert Aenderungsprotokoll
- [ ] `GET /api/menu` Endpunkt liefert die Menue-Struktur
- [ ] `GET /api/actuator/health` oder eigener Health-Check antwortet mit 200
- [ ] `port` in `portal-app.yaml` stimmt mit dem exponierten Container-Port ueberein
- [ ] Routen in `portal-app-menu.yaml` stimmen mit Angular-Routen ueberein
- [ ] `useCases` in `portal-app.yaml` definiert (alle Anwendungsfaelle der App)
- [ ] Berechtigungspruefung in App-Endpunkten implementiert (Portal-JWT auswerten)
- [ ] App startet ohne manuelle Konfiguration (nur Umgebungsvariablen)
- [ ] CORS erlaubt Zugriffe vom Portal (`*` oder Portal-URL)
- [ ] Deutsche Oberflaeche (de-DE)
- [ ] Fira Sans Schriftart eingebunden

### Empfohlen

- [ ] `version` folgt SemVer (z.B. 1.0.0)
- [ ] `description` in `portal-app.yaml` ist aussagekraeftig
- [ ] Parameter haben `description` Felder fuer den uebergreifenden Dialog
- [ ] `validationRule` fuer SELECT-Parameter enthaelt die Optionen als JSON-Array
- [ ] Responsive Design (Mobile-First, iPhone-tauglich)
- [ ] Dark Mode Unterstuetzung (`dark:` Tailwind-Klassen)
- [ ] Tailwind CSS Portal-Design-System eingehalten
- [ ] `README.md` mit Entwickler-Dokumentation
- [ ] Flyway-Migrationen fuer alle Datenbank-Aenderungen
- [ ] Sinnvolle Kategorisierung der Parameter

### Sicherheit

- [ ] Keine Secrets in `portal-app.yaml` (Umgebungsvariablen nutzen)
- [ ] SQL-Injection geschuetzt (JPA/Prepared Statements)
- [ ] XSS geschuetzt (Angular sanitization)
- [ ] CSRF deaktiviert nur fuer API-Endpunkte
- [ ] Keine Debug-Endpunkte in Produktion

---

## 15. Beispiel: Minimale App

Eine minimale App die alle Kriterien erfuellt:

### portal-app.yaml

```yaml
name: Minimale Demo App
version: 1.0.0
dockerfile: Dockerfile
port: 80
healthCheck: /api/actuator/health

useCases:
  - key: demo-app-home
    label: "Demo App - Startseite"
    beschreibung: "Zugriff auf die Startseite der Demo App"
  - key: demo-app-settings
    label: "Demo App - Einstellungen"
    beschreibung: "App-Einstellungen verwalten"
```

### portal-app-menu.yaml

```yaml
menu:
  label: Demo App
  icon: clipboard
  defaultRoute: /
  children:
    - id: home
      label: Startseite
      route: /
      icon: home
      order: 1
    - id: settings
      label: Einstellungen
      route: /einstellungen
      icon: settings
      order: 2
```

### V2__create_app_parameter.sql

```sql
CREATE TABLE app_parameter (
    id              VARCHAR(100) PRIMARY KEY,
    param_key       VARCHAR(200) NOT NULL UNIQUE,
    label           VARCHAR(200) NOT NULL,
    description     TEXT,
    app_id          VARCHAR(50) NOT NULL,
    app_name        VARCHAR(100) NOT NULL,
    param_group     VARCHAR(100) NOT NULL,
    param_type      VARCHAR(50) NOT NULL,
    param_value     TEXT,
    default_value   TEXT,
    required        BOOLEAN DEFAULT false,
    validation_rules VARCHAR(500),
    options         TEXT,
    unit            VARCHAR(50),
    sensitive       BOOLEAN DEFAULT false,
    hot_reload      BOOLEAN DEFAULT false,
    last_modified   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gueltig_von     TIMESTAMP DEFAULT '1970-01-01 00:00:00',
    gueltig_bis     TIMESTAMP DEFAULT '9999-12-31 23:59:59',
    tenant_id       VARCHAR(50)
);

CREATE TABLE parameter_audit_log (
    id              VARCHAR(50) PRIMARY KEY,
    parameter_id    VARCHAR(100) NOT NULL,
    param_key       VARCHAR(200) NOT NULL,
    app_id          VARCHAR(50),
    app_name        VARCHAR(100),
    alter_wert      TEXT,
    neuer_wert      TEXT,
    geaendert_von   VARCHAR(100) NOT NULL,
    geaendert_am    TIMESTAMP NOT NULL DEFAULT NOW(),
    grund           TEXT,
    tenant_id       VARCHAR(50)
);

-- Globaler Parameter (tenant_id = NULL, gilt fuer alle Mandanten)
INSERT INTO app_parameter (id, param_key, label, app_id, app_name, param_group, param_type, param_value, default_value)
VALUES ('p1', 'app.name', 'App-Name', 'demo-app', 'Demo App', 'Allgemein', 'STRING', 'Demo App', 'Demo App');
```

---

## 16. Aenderungsprotokoll

> **Regel:** Jedes Mal wenn neue Anforderungen, Schnittstellen oder Kriterien hinzukommen, die eine App erfuellen muss um im Portal installierbar zu sein, MUSS diese Datei aktualisiert werden.

| Datum       | Aenderung                                                          |
|-------------|---------------------------------------------------------------------|
| 2026-03-13  | Erstversion: Menue-Konfiguration, AppParameter, Deployment-Manifest |
| 2026-03-13  | Authentifizierung: OTP-basierte Anmeldung (kein Passwort), JWT-Token |
| 2026-03-13  | Autorisierung: Feingranulare Gruppenberechtigungen pro Use Case     |
| 2026-03-13  | Multi-Mandant: Benutzer koennen mehreren Mandanten zugeordnet sein  |
| 2026-03-13  | Mandanten: Erweitert um Adresse, Kontaktdaten, Ansprechpartner     |
| 2026-03-13  | Benutzer: Erweitert um Personendaten, mehrere Adressen, Hauptadresse|
| 2026-03-13  | Audit-Log: Sicherheitsrelevante Aktionen werden protokolliert       |
| 2026-03-13  | App-Berechtigungen: useCases in portal-app.yaml, auto-Sync bei Install |
| 2026-03-13  | Super-Admin: Mandantenuebergreifender Administrator                 |
| 2026-03-13  | App-Installation: Nur noch fuer Administratoren (appstore-admin)    |
| 2026-03-13  | Use-Case-API: REST-Endpunkt zur Laufzeit-Registrierung von Use Cases|
| 2026-03-13  | Parameter-Schema: Neues Schema mit app_id, app_name, param_group, unit, sensitive, hot_reload |
| 2026-03-13  | Parameter-Typen: Vereinfacht auf STRING, NUMBER, BOOLEAN, EMAIL, URL, SELECT, DATE, PASSWORD, TEXTAREA |
| 2026-03-13  | Parameter-Validierung: Automatische Typ-basierte Validierung bei Wertaenderungen |
| 2026-03-13  | Parameter-Audit-Log: Jede Aenderung wird protokolliert (wer, wann, was, warum) |
| 2026-03-13  | Parameter-Gueltigkeit: Zeitliche Gueltigkeit mit gueltig_von/gueltig_bis |
| 2026-03-13  | Super-User: Standard-Super-Admin Sebastian Olberding (portal@olberding.net) |
| 2026-03-13  | Parameter-Mandanten: tenant_id auf Parametern, Mandanten-Isolation im Backend |

---

## 17. Haeufige Fehler

| Problem                                     | Loesung                                              |
|---------------------------------------------|------------------------------------------------------|
| App wird nicht im App Store angezeigt       | `portal-app.yaml` pruefen, `repositoryUrl` gesetzt?  |
| Menue zeigt keine Unterseiten              | `portal-app-menu.yaml` fehlt oder `GET /api/menu` antwortet nicht |
| Parameter erscheinen nicht im Dialog        | `GET /api/parameters` pruefen, `app_parameter` Tabelle angelegt? |
| Container startet nicht                     | `port` in `portal-app.yaml` stimmt nicht mit `EXPOSE` im Dockerfile |
| CORS-Fehler beim Zugriff vom Portal        | `CorsConfig` pruefen -- `allowedOrigins("*")` setzen |
| Deployment schlaegt fehl                   | Deploy-Log pruefen (`GET /api/deployments/{id}/status`) |
| Routen funktionieren nicht                  | Angular-Routen muessen mit `portal-app-menu.yaml` uebereinstimmen |
| 401 Unauthorized bei API-Aufrufen          | JWT-Token fehlt, `Authorization: Bearer <token>` Header setzen    |
| Benutzer sieht Menuepunkt nicht            | `anzeigen`-Berechtigung fuer den Use Case in der Gruppe pruefen   |
| Mandantenwechsel schlaegt fehl             | Benutzer muss dem Zielmandanten zugeordnet sein (user_tenants)     |
| App-Berechtigungen fehlen nach Installation | `useCases` in `portal-app.yaml` pruefen, werden beim Deployment gelesen |
| Installieren-Button nicht sichtbar          | Nur Benutzer mit `appstore-admin` Berechtigung (Schreiben) koennen installieren |
| App-Use-Cases nicht in Gruppenverwaltung    | App muss installiert UND deployed sein, Use Cases muessen im Manifest stehen |
| Parameter-Wert wird abgelehnt              | Typ-Validierung pruefen: NUMBER muss Zahl sein, BOOLEAN nur true/false, etc. |
| Audit-Log ist leer                          | `parameter_audit_log` Tabelle angelegt? `PATCH /value` statt `PUT` verwenden |
| Parameter nicht mehr gueltig               | `gueltig_bis` pruefen, ggf. mit neuem Zeitraum erneut freigeben |
| Parameter eines anderen Mandanten sichtbar | `tenant_id` pruefen, muss dem eigenen Mandanten zugeordnet oder NULL (global) sein |
| Mandantenspezifischer Parameter fehlt      | Parameter hat falschen `tenant_id`, Super-Admin kann alle sehen |
