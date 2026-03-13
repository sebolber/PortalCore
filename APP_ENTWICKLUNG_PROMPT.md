# Prompt: Neue App fuer das Health Portal entwickeln

> **Diese Datei ist die zentrale Anleitung fuer KI-Assistenten und Entwickler, die eine neue App erstellen, die im Health Portal ueber den App Store installierbar sein soll.**
> **Diese Datei muss bei jeder neuen Anforderung aktualisiert werden.**

---

## Letzte Aktualisierung

- **Datum:** 2026-03-13
- **Aenderungshistorie:**
  - 2026-03-13: Erstversion mit Menue-Konfiguration, AppParameter-Schema, Deployment-Manifest, und vollstaendiger Projektstruktur

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
    category        VARCHAR(100) NOT NULL,         -- Gruppierung (z.B. "Allgemein", "Abrechnung")
    name            VARCHAR(200) NOT NULL,         -- Anzeigename
    description     TEXT,                          -- Beschreibung / Hilfetext
    parameter_key   VARCHAR(200) NOT NULL UNIQUE,  -- Technischer Schluessel (z.B. "abrechnung.mwst.satz")
    parameter_value TEXT,                          -- Aktueller Wert
    default_value   TEXT,                          -- Standard-Wert
    parameter_type  VARCHAR(50) NOT NULL,          -- Datentyp (siehe 7.2)
    validation_rule VARCHAR(500),                  -- Validierungsregel (Regex oder JSON-Schema)
    required        BOOLEAN DEFAULT false,         -- Pflichtfeld?
    editable        BOOLEAN DEFAULT true,          -- Vom Benutzer aenderbar?
    sort_order      INT DEFAULT 0,                 -- Sortierung innerhalb der Kategorie
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beispiel-Daten
INSERT INTO app_parameter (id, category, name, description, parameter_key, parameter_value, default_value, parameter_type, required, editable, sort_order) VALUES
('param-001', 'Allgemein', 'Anwendungsname', 'Name der Anwendung', 'app.name', 'Meine App', 'Meine App', 'STRING', true, false, 1),
('param-002', 'Allgemein', 'Max. Ergebnisse pro Seite', 'Maximale Anzahl Ergebnisse in Listenansichten', 'app.pagination.pageSize', '25', '25', 'INTEGER', false, true, 2),
('param-003', 'Abrechnung', 'MwSt-Satz (%)', 'Standard Mehrwertsteuersatz', 'abrechnung.mwst.satz', '19.0', '19.0', 'DECIMAL', true, true, 1),
('param-004', 'Abrechnung', 'Waehrung', 'Standard-Waehrung', 'abrechnung.waehrung', 'EUR', 'EUR', 'SELECT', true, true, 2),
('param-005', 'Benachrichtigungen', 'E-Mail Benachrichtigungen', 'E-Mail Benachrichtigungen aktivieren', 'notification.email.enabled', 'true', 'true', 'BOOLEAN', false, true, 1);
```

### 7.2 Parameter-Typen

| Typ         | Beschreibung                        | Beispielwert           |
|-------------|-------------------------------------|------------------------|
| `STRING`    | Freitext                            | `"Mein Wert"`          |
| `INTEGER`   | Ganzzahl                            | `"42"`                 |
| `DECIMAL`   | Dezimalzahl                         | `"19.5"`               |
| `BOOLEAN`   | Wahrheitswert                       | `"true"` / `"false"`   |
| `DATE`      | Datum (ISO 8601)                    | `"2026-01-15"`         |
| `DATETIME`  | Datum mit Uhrzeit                   | `"2026-01-15T10:30:00"`|
| `SELECT`    | Auswahl (Optionen in validation)    | `"EUR"`                |
| `MULTISELECT` | Mehrfachauswahl                   | `"DE,AT,CH"`           |
| `JSON`      | Strukturierte Daten                 | `'{"key":"value"}'`    |
| `PASSWORD`  | Verschluesselter Wert               | `"***"`                |
| `URL`       | URL                                 | `"https://example.com"`|
| `EMAIL`     | E-Mail-Adresse                      | `"test@example.com"`   |

### 7.3 Parameter-Entity (Spring Boot)

```java
@Entity
@Table(name = "app_parameter")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppParameter {

    @Id
    private String id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "parameter_key", nullable = false, unique = true)
    private String parameterKey;

    @Column(name = "parameter_value", columnDefinition = "TEXT")
    private String parameterValue;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "parameter_type", nullable = false)
    private String parameterType;

    @Column(name = "validation_rule")
    private String validationRule;

    @Column(nullable = false)
    private boolean required;

    @Column(nullable = false)
    private boolean editable;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 7.4 Parameter-REST-API (Pflicht)

Die App muss folgende Endpunkte bereitstellen:

```
GET    /api/parameters                    -- Alle Parameter auflisten
GET    /api/parameters/{key}              -- Einzelnen Parameter abrufen
PUT    /api/parameters/{key}              -- Parameterwert aendern
GET    /api/parameters/categories         -- Alle Kategorien auflisten
GET    /api/parameters?category={name}    -- Parameter nach Kategorie filtern
POST   /api/parameters/reset/{key}        -- Parameter auf Standardwert zuruecksetzen
```

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
    public List<AppParameter> getAll(@RequestParam(required = false) String category) {
        if (category != null) {
            return parameterService.findByCategory(category);
        }
        return parameterService.findAll();
    }

    @GetMapping("/{key}")
    public AppParameter getByKey(@PathVariable String key) {
        return parameterService.findByKey(key);
    }

    @PutMapping("/{key}")
    public AppParameter update(@PathVariable String key, @RequestBody Map<String, String> body) {
        return parameterService.updateValue(key, body.get("value"));
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return parameterService.findAllCategories();
    }

    @PostMapping("/reset/{key}")
    public AppParameter reset(@PathVariable String key) {
        return parameterService.resetToDefault(key);
    }
}
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

## 13. Checkliste fuer neue Apps

### Pflicht -- ohne diese Punkte ist die App nicht installierbar

- [ ] `portal-app.yaml` im Repository-Root vorhanden
- [ ] `portal-app-menu.yaml` im Repository-Root vorhanden
- [ ] `Dockerfile` im Repository-Root (Multi-Stage Build)
- [ ] `app_parameter` Tabelle per Flyway-Migration angelegt
- [ ] `GET /api/parameters` Endpunkt liefert alle Parameter
- [ ] `GET /api/menu` Endpunkt liefert die Menue-Struktur
- [ ] `GET /api/actuator/health` oder eigener Health-Check antwortet mit 200
- [ ] `port` in `portal-app.yaml` stimmt mit dem exponierten Container-Port ueberein
- [ ] Routen in `portal-app-menu.yaml` stimmen mit Angular-Routen ueberein
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

## 14. Beispiel: Minimale App

Eine minimale App die alle Kriterien erfuellt:

### portal-app.yaml

```yaml
name: Minimale Demo App
version: 1.0.0
dockerfile: Dockerfile
port: 80
healthCheck: /api/actuator/health
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
    category        VARCHAR(100) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    parameter_key   VARCHAR(200) NOT NULL UNIQUE,
    parameter_value TEXT,
    default_value   TEXT,
    parameter_type  VARCHAR(50) NOT NULL,
    validation_rule VARCHAR(500),
    required        BOOLEAN DEFAULT false,
    editable        BOOLEAN DEFAULT true,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_parameter (id, category, name, parameter_key, parameter_value, default_value, parameter_type, sort_order)
VALUES ('p1', 'Allgemein', 'App-Name', 'app.name', 'Demo App', 'Demo App', 'STRING', 1);
```

---

## 15. Aenderungsprotokoll

> **Regel:** Jedes Mal wenn neue Anforderungen, Schnittstellen oder Kriterien hinzukommen, die eine App erfuellen muss um im Portal installierbar zu sein, MUSS diese Datei aktualisiert werden.

| Datum       | Aenderung                                                          |
|-------------|---------------------------------------------------------------------|
| 2026-03-13  | Erstversion: Menue-Konfiguration, AppParameter, Deployment-Manifest |

---

## 16. Haeufige Fehler

| Problem                                     | Loesung                                              |
|---------------------------------------------|------------------------------------------------------|
| App wird nicht im App Store angezeigt       | `portal-app.yaml` pruefen, `repositoryUrl` gesetzt?  |
| Menue zeigt keine Unterseiten              | `portal-app-menu.yaml` fehlt oder `GET /api/menu` antwortet nicht |
| Parameter erscheinen nicht im Dialog        | `GET /api/parameters` pruefen, `app_parameter` Tabelle angelegt? |
| Container startet nicht                     | `port` in `portal-app.yaml` stimmt nicht mit `EXPOSE` im Dockerfile |
| CORS-Fehler beim Zugriff vom Portal        | `CorsConfig` pruefen -- `allowedOrigins("*")` setzen |
| Deployment schlaegt fehl                   | Deploy-Log pruefen (`GET /api/deployments/{id}/status`) |
| Routen funktionieren nicht                  | Angular-Routen muessen mit `portal-app-menu.yaml` uebereinstimmen |
