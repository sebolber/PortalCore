# App-Anforderungen fuer das Health Portal

Dieses Dokument beschreibt alle technischen und gestalterischen Anforderungen, die eine neue App erfuellen muss, damit sie im Health Portal lauffaehig ist und korrekt integriert werden kann.

---

## 1. Architektur-Ueberblick

Das Health Portal besteht aus drei Containern:

| Service    | Technologie                  | Port | Beschreibung                         |
|------------|------------------------------|------|--------------------------------------|
| `postgres` | PostgreSQL 16 Alpine         | 5432 | Datenbank (DB: `portal`, User: `portal`) |
| `backend`  | Spring Boot 3 + Java 21      | 8080 | REST API unter `/api`                |
| `frontend` | Angular 18 + Tailwind CSS 3  | 4200 (dev) / 80 (prod via Nginx) | SPA mit Standalone Components |

Eine neue App wird als **Eintrag in der Datenbank** (`portal_apps`) registriert und kann entweder:
- **Intern** als Angular-Standalone-Component im Portal laufen (mit eigener Route)
- **Extern** als eigenstaendige Anwendung unter einer eigenen URL erreichbar sein (`applicationUrl`)

---

## 2. App-Registrierung (Datenbank)

Jede App muss in der Tabelle `portal_apps` registriert werden. Die Registrierung kann ueber die REST API oder direkt per Flyway-Migration erfolgen.

### 2.1 Pflichtfelder

| Feld              | Typ            | Beschreibung                              | Beispiel                           |
|-------------------|----------------|-------------------------------------------|------------------------------------|
| `id`              | VARCHAR(50) PK | Eindeutige App-ID (kebab-case empfohlen)  | `meine-neue-app`                   |
| `name`            | VARCHAR(200)   | Anzeigename der App                       | `Meine Neue App`                   |
| `category`        | ENUM (String)  | Kategorie (siehe Enum-Werte unten)        | `VERWALTUNG`                       |
| `market_segment`  | ENUM (String)  | Marktsegment                              | `KOSTENTRAEGER`                    |
| `app_type`        | ENUM (String)  | `ANWENDUNG` oder `INTEGRATION`            | `ANWENDUNG`                        |
| `vendor`          | ENUM (String)  | Herstellertyp                             | `DRITTANBIETER`                    |
| `price`           | VARCHAR(30)    | `kostenlos` oder `lizenzpflichtig`        | `kostenlos`                        |

### 2.2 Optionale Felder

| Feld                | Typ            | Beschreibung                                       |
|---------------------|----------------|-----------------------------------------------------|
| `short_description` | VARCHAR(500)   | Kurzbeschreibung fuer App-Store-Kachel              |
| `long_description`  | TEXT           | Ausfuehrliche Beschreibung fuer Detailseite         |
| `vendor_name`       | VARCHAR(100)   | Anzeigename des Herstellers                         |
| `version`           | VARCHAR(20)    | Versionsnummer (SemVer empfohlen)                   |
| `icon_color`        | VARCHAR(20)    | Hex-Farbcode fuer App-Avatar                        |
| `icon_initials`     | VARCHAR(10)    | 2 Buchstaben fuer App-Avatar                        |
| `rating`            | DOUBLE         | Bewertung 0-5                                       |
| `review_count`      | INT            | Anzahl Bewertungen                                  |
| `install_count`     | INT            | Anzahl Installationen                               |
| `tags`              | TEXT           | Komma-getrennte Schlagwoerter                       |
| `compatibility`     | TEXT           | Komma-getrennte Kompatibilitaetseintraege            |
| `featured`          | BOOLEAN        | Hervorgehobene App im Store                         |
| `is_new`            | BOOLEAN        | Als "Neu" markieren                                 |
| `route`             | VARCHAR(100)   | Interne Angular-Route (z.B. `/meine-app`)           |
| `repository_url`    | VARCHAR(500)   | Git-Repository-URL                                  |
| `application_url`   | VARCHAR(500)   | URL der laufenden Anwendung                         |

### 2.3 Enum-Werte

**AppCategory:**
```
ABRECHNUNG, FALLMANAGEMENT, VERWALTUNG, KI_AGENTEN,
ANALYSE, KOMMUNIKATION, INTEGRATION, FORMULARE
```

**MarketSegment:**
```
STEUERUNG_PRUEFSTELLEN, KOSTENTRAEGER, ABRECHNUNGSDIENSTLEISTER,
LEISTUNGSERBRINGER, INFRASTRUKTUR_PLATTFORMEN, OEFFENTLICHE_HAND_FORSCHUNG
```

**AppType:**
```
ANWENDUNG     -- Eigenstaendige Anwendung mit UI
INTEGRATION   -- Hintergrund-Integration ohne eigenes UI
```

**AppVendor:**
```
HEALTH_PORTAL    -- Vom Portal-Team entwickelt
PLATFORM         -- Plattform-Komponente
COMMUNITY        -- Community-Beitrag
DRITTANBIETER    -- Externer Anbieter
```

---

## 3. REST API Endpunkte

Basis-URL: `http://<host>:8080/api`

### 3.1 App-Katalog

| Methode | Pfad                    | Beschreibung                         |
|---------|-------------------------|--------------------------------------|
| GET     | `/apps`                 | Alle Apps auflisten (Filter: `category`, `marketSegment`, `vendor`, `q`, `appType`) |
| GET     | `/apps/{id}`            | App-Details abrufen                  |
| GET     | `/apps/featured`        | Hervorgehobene Apps abrufen          |
| POST    | `/apps`                 | Neue App anlegen                     |
| PUT     | `/apps/{id}`            | App aktualisieren                    |
| DELETE  | `/apps/{id}`            | App loeschen                         |

### 3.2 App-Installation (pro Mandant)

| Methode | Pfad                                       | Beschreibung                     |
|---------|---------------------------------------------|----------------------------------|
| GET     | `/tenants/{tenantId}/installed-apps`         | Installierte Apps des Mandanten  |
| POST    | `/tenants/{tenantId}/installed-apps`         | App installieren (`{ "appId": "..." }`) |
| DELETE  | `/tenants/{tenantId}/installed-apps/{appId}` | App deinstallieren               |

### 3.3 Nachrichtencenter (Messages & Tasks)

| Methode | Pfad                                | Beschreibung                              |
|---------|-------------------------------------|-------------------------------------------|
| GET     | `/nachricht/posteingang`            | Posteingang des Benutzers (optional: `?typ=NACHRICHT\|AUFGABE`) |
| GET     | `/nachricht/gesendet`               | Gesendete Nachrichten/Aufgaben            |
| GET     | `/nachricht/archiv`                 | Archivierte Eintraege                     |
| GET     | `/nachricht/ungelesen-anzahl`       | Anzahl ungelesener Eintraege              |
| GET     | `/nachricht/{id}`                   | Nachricht/Aufgabe im Detail (markiert als gelesen) |
| POST    | `/nachricht`                        | Nachricht oder Aufgabe erstellen          |
| PUT     | `/nachricht/{id}/gelesen`           | Als gelesen markieren                     |
| PUT     | `/nachricht/{id}/ungelesen`         | Als ungelesen markieren                   |
| PUT     | `/nachricht/{id}/archivieren`       | Archivieren                               |
| PUT     | `/nachricht/{id}/erledigt`          | Als erledigt markieren (auto-archiviert)  |
| PUT     | `/nachricht/alle-gelesen`           | Alle als gelesen markieren                |
| POST    | `/nachricht/{id}/unteraufgaben`     | Unteraufgabe zu einer Aufgabe erstellen   |
| GET     | `/nachricht/{id}/unteraufgaben`     | Unteraufgaben einer Aufgabe auflisten     |
| POST    | `/nachricht/{id}/anhaenge`          | Dateianhang hochladen (multipart)         |
| GET     | `/nachricht/anhaenge/{anhangId}`    | Dateianhang herunterladen                 |

### 3.4 Dashboard Widgets

| Methode | Pfad                                     | Beschreibung                          |
|---------|------------------------------------------|---------------------------------------|
| GET     | `/dashboard/widget-definitionen`         | Alle verfuegbaren Widget-Definitionen |
| GET     | `/dashboard/widgets`                     | Widgets des aktuellen Benutzers       |
| POST    | `/dashboard/widgets`                     | Widget hinzufuegen                    |
| PUT     | `/dashboard/widgets/layout`              | Layout aller Widgets speichern        |
| DELETE  | `/dashboard/widgets/{id}`                | Widget entfernen                      |
| GET     | `/dashboard/seiten`                      | Alle Portal-Seiten (fuer Quicklinks)  |

### 3.5 Weitere relevante Endpunkte

| Methode | Pfad                    | Beschreibung                         |
|---------|-------------------------|--------------------------------------|
| GET     | `/dashboard/stats`      | Portal-Statistiken                   |
| GET     | `/permissions`          | Berechtigungen auflisten             |
| GET/PUT | `/parameters`           | Systemparameter verwalten            |
| GET     | `/messages`             | System-Benachrichtigungen abrufen    |

---

## 4. E-Mail-Konfiguration und Authentifizierung

Das Portal verwendet OTP-basierte Authentifizierung per E-Mail (keine Passwoerter). Die Konfiguration erfolgt bei der Erstinstallation ueber `portal-init.yml`:

### 4.1 Erstinstallation

1. `portal-init.example.yml` kopieren nach `portal-init.yml`
2. SMTP-Server, Benutzername, Passwort und Absenderadresse eintragen
3. Super-User Daten konfigurieren (Name, E-Mail, Mandant)
4. Datei als Docker-Volume mounten: `-v ./portal-init.yml:/app/config/portal-init.yml:ro`
5. Portal starten -- Parameter werden automatisch befuellt

### 4.2 Pflicht-Parameter fuer SMTP

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|---------|
| `portal.email.smtp.host` | SMTP-Server | `smtp.office365.com` |
| `portal.email.smtp.port` | Port (587 STARTTLS, 465 SSL) | `587` |
| `portal.email.smtp.username` | SMTP-Benutzername | `portal@firma.de` |
| `portal.email.smtp.password` | SMTP-Passwort | _(sensitiv)_ |
| `portal.email.smtp.auth` | Authentifizierung | `true` |
| `portal.email.smtp.starttls` | STARTTLS (Port 587) | `true` |
| `portal.email.smtp.ssl` | SSL/TLS (Port 465) | `false` |
| `portal.email.from` | Absenderadresse | `portal@firma.de` |

### 4.3 Optionale Parameter

- **IMAP** (`portal.email.imap.*`): Posteingang-Konfiguration
- **POP3** (`portal.email.pop3.*`): Alternativ zu IMAP
- **OTP** (`portal.auth.otp.*`): Code-Laenge, Gueltigkeit, Rate-Limit

### 4.4 Nach der Installation

Alle Parameter koennen spaeter ueber die **Admin-Oberflaeche** unter "Parameter" geaendert werden. Nur Super-Admins haben Zugriff auf E-Mail-Einstellungen (`admin_only`). Aenderungen werden im Audit-Log protokolliert.

> **Entwicklung:** `OTP_SEND_MAIL=false` als Umgebungsvariable setzen. Der OTP-Code wird dann im Backend-Log ausgegeben statt per E-Mail versendet.

---

## 5. Installations- und Navigationsverhalten

### 5.1 Installationsablauf
1. Benutzer oeffnet den **App-Store** im Portal
2. Waehlt eine App aus und klickt **"Installieren"**
3. Backend erstellt einen `installed_apps`-Eintrag mit Status `ACTIVE`
4. Die **Sidebar** laedt die installierten Apps neu
5. Die App erscheint im Navigationsbereich **"Installierte Anwendungen"**

### 5.2 Navigation nach Installation
Die installierte App erscheint in der Sidebar mit:
- **Farbigem Avatar** (`icon_color` + `icon_initials`)
- **App-Name** als Link

Der Link fuehrt zu:
- `applicationUrl` (wenn gesetzt) -- fuer externe Anwendungen
- `route` (wenn gesetzt) -- fuer interne Angular-Routen
- `/appstore/{appId}` (Fallback) -- App-Detailseite

### 5.3 Deinstallation
- Entfernt den `installed_apps`-Eintrag
- Die App verschwindet aus der Sidebar-Navigation
- Die App bleibt im App-Store-Katalog verfuegbar

---

## 6. Design-System und Styling

### 6.1 Farben

**Primaerfarbe:**
```
#006EC7 (Standard)
#004F8F (Hover/Dark)
#EBF3FA (Light/Background)
```

**Graustufen:**
```
50:  #FAF9F7    300: #C8C2BC    600: #706661    900: #252220
100: #F0EEEB    400: #A89F97    700: #574F4A    950: #171514
200: #E0DCD8    500: #887D75    800: #3D3734
```

**Akzentfarben:**
```
Tuerkis:  #28DCAA     Orange: #FF9868     Gruen:  #76C800
Pink:     #F566BA     Violett: #461EBE    Gelb:   #FFFF00
```

**Semantische Farben:**
```
Success: #28A745     Warning: #FFC107     Error: #CC3333     Info: #17A2B8
```

### 6.2 Typografie

| Verwendung         | Schriftart             | Gewichte           |
|--------------------|-----------------------|--------------------|
| Fliesstext, Labels | Fira Sans             | 300, 400, 500, 700 |
| Ueberschriften     | Fira Sans Condensed   | 400, 500, 600, 700 |

Font-Import (im HTML `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500;700&family=Fira+Sans+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 6.3 CSS-Klassen (global verfuegbar)

```css
.btn-primary        /* Primaerer Button: blauer Hintergrund, weisser Text, abgerundet */
.btn-secondary      /* Sekundaerer Button: weisser Hintergrund, blauer Rahmen */
.card               /* Kartencontainer: weisser Hintergrund, abgerundet, Schatten */
.input-field        /* Eingabefeld: volle Breite, grauer Rahmen, abgerundet */
.badge              /* Basis-Badge: abgerundet, klein */
.badge-primary      /* Blauer Badge */
.badge-success      /* Gruener Badge */
.badge-warning      /* Gelber Badge */
.badge-error        /* Roter Badge */
```

### 6.4 CSS Custom Properties

```css
:root {
  --color-primary: #006EC7;
  --color-primary-dark: #004F8F;
  --color-primary-light: #EBF3FA;
}
```

### 6.5 Dark Mode

- Aktivierung ueber CSS-Klasse `dark` am Root-Element
- Tailwind-Konfiguration: `darkMode: 'class'`
- Karten: `.dark .card { @apply bg-gray-800; }`
- Body: `.dark body { @apply bg-gray-900 text-gray-100; }`

---

## 7. Frontend-Architektur (Angular)

### 7.1 Technologie-Stack

| Technologie        | Version   |
|--------------------|-----------|
| Angular            | 18+       |
| TypeScript         | 5.x       |
| Tailwind CSS       | 3.4+      |
| RxJS               | 7.8       |
| Node.js (Build)    | 20        |

### 7.2 Component-Pattern

Alle Seiten sind **Standalone Components** mit Inline-Templates:

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meine-seite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Seiteninhalt hier -->
    <div class="space-y-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Seitentitel</h1>
        <p class="text-sm text-gray-500 mt-1">Beschreibung</p>
      </div>

      <!-- Inhalt -->
      <div class="card">
        <p>Karteninhalt</p>
      </div>
    </div>
  `,
})
export class MeineSeiteComponent {
  // Signals fuer lokalen State
  readonly items = signal<Item[]>([]);
  readonly selectedItem = signal<Item | null>(null);
  readonly filteredItems = computed(() =>
    this.items().filter(i => i.active)
  );
}
```

### 7.3 Routing-Integration

Neue interne Apps muessen in `frontend/src/app/app.routes.ts` registriert werden:

```typescript
{
  path: 'meine-app',
  loadComponent: () => import('./pages/meine-app/meine-app.component')
    .then(m => m.MeineAppComponent)
}
```

### 7.4 State Management

**Lokaler State:** Angular Signals (`signal()`, `computed()`)

**Globaler State:** `PortalStateService` (Singleton)

Verfuegbare Properties:
```typescript
portalState.currentTenant()       // Signal<Tenant>  -- Aktueller Mandant
portalState.currentTenantSnapshot // Tenant           -- Snapshot-Zugriff
portalState.userRole()            // Signal<string>   -- 'admin' oder 'user'
portalState.isDarkTheme()         // Signal<boolean>  -- Dark Mode aktiv?
portalState.sidebarCollapsed()    // Signal<boolean>  -- Sidebar eingeklappt?
portalState.mobileSidebarOpen     // Signal<boolean>  -- Mobile Sidebar offen?
```

### 7.5 API-Anbindung

Basis-Service (`ApiService`) stellt geschuetzte HTTP-Methoden bereit:

```typescript
import { API_URL } from './api.service';

// API_URL = '/api'
// In Entwicklung: Proxy leitet /api -> http://localhost:8080 weiter
// In Produktion: Nginx leitet /api -> Backend-Container weiter
```

Eigene Services fuer die App erstellen:

```typescript
@Injectable({ providedIn: 'root' })
export class MeineAppService {
  private http = inject(HttpClient);
  private basePath = `${API_URL}/meine-app`;

  getAll(): Observable<MeineDaten[]> {
    return this.http.get<MeineDaten[]>(this.basePath);
  }
}
```

---

## 8. Backend-Architektur (Spring Boot)

### 8.1 Technologie-Stack

| Technologie   | Version     |
|---------------|-------------|
| Java          | 21          |
| Spring Boot   | 3.x         |
| PostgreSQL    | 16          |
| Flyway        | (integriert)|
| Lombok        | (integriert)|
| Maven         | 3.9         |

### 8.2 Paketstruktur

```
de.portalcore/
  controller/    -- REST-Controller (@RestController)
  service/       -- Business-Logik (@Service)
  entity/        -- JPA-Entities (@Entity)
  repository/    -- Spring Data JPA Repositories
  enums/         -- Enum-Typen
```

### 8.3 Controller-Pattern

```java
@RestController
@RequestMapping("/meine-app")
@CrossOrigin(origins = "*")
public class MeineAppController {

    private final MeineAppService service;

    public MeineAppController(MeineAppService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MeineDaten>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<MeineDaten> create(@RequestBody MeineDaten daten) {
        return ResponseEntity.ok(service.save(daten));
    }
}
```

### 8.4 Entity-Pattern

```java
@Entity
@Table(name = "meine_tabelle")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeineDaten {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    // ... weitere Felder
}
```

### 8.5 Datenbank-Migrationen

Neue Tabellen und Seed-Daten ueber Flyway-Migrationen anlegen:

```
backend/src/main/resources/db/migration/
  V1__create_schema.sql                             -- Kern-Schema
  V2__seed_data.sql                                 -- Testdaten
  V3__add_app_urls.sql                              -- App-URLs
  V4__add_deployment_fields.sql                     -- Docker Deployment
  V5__auth_groups_permissions.sql                   -- Gruppen & Berechtigungen
  V6__app_permissions_superadmin.sql                -- App Use Cases, Super-Admin
  V7__superuser_parameter_audit.sql                 -- Parameter & Audit-Log
  V8__parameter_tenant_support.sql                  -- Mandantenspezifische Parameter
  V9__portal_theme_and_custom_menu.sql              -- Theme & Menue-Konfiguration
  V10__email_config_and_auth_toggle.sql             -- E-Mail & Auth-Einstellungen
  V11__nachrichtencenter.sql                        -- Nachrichtencenter (Messages & Tasks)
  V12__dashboard_widgets.sql                        -- Dashboard-Widget-System
  V13__unteraufgaben_und_posteingang_widget.sql     -- Unteraufgaben & Posteingang-Widget
  V14__meine_app_schema.sql                         -- NEUE Migration fuer die App
```

**Namenskonvention:** `V{nummer}__{beschreibung}.sql`

### 8.6 Konfiguration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/portal
    username: portal
    password: portal
  jpa:
    hibernate:
      ddl-auto: validate    # Schema wird durch Flyway verwaltet
  flyway:
    enabled: true

server:
  servlet:
    context-path: /api       # Alle Endpunkte unter /api
```

---

## 9. Responsive Design

### 9.1 Breakpoints (Tailwind Standard)

| Breakpoint | Mindestbreite | Verwendung              |
|------------|---------------|-------------------------|
| (default)  | 0px           | Mobile (iPhone)         |
| `sm:`      | 640px         | Kleine Tablets          |
| `md:`      | 768px         | Tablets, Desktop-Start  |
| `lg:`      | 1024px        | Desktop                 |
| `xl:`      | 1280px        | Grosse Bildschirme      |

### 9.2 Mobile-First Regeln

1. **Standard-Layout** ist fuer Mobilgeraete optimiert
2. Groessere Layouts werden mit `sm:`, `md:`, `lg:` ergaenzt
3. **Tabellen** benoetigen `overflow-x-auto` und `min-w-[...]` auf dem Container
4. **Header-Bereiche** sollen auf Mobile vertikal stapeln: `flex-col sm:flex-row`
5. **Grids** starten einspalttig: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
6. **Die Sidebar** ist auf Mobile ein Overlay (ab `md:` fixiert sichtbar)

### 9.3 Beispiel: Responsive Seitenlayout

```html
<!-- Header -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
  <div>
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Seitentitel</h1>
    <p class="text-sm text-gray-500 mt-1">Beschreibung</p>
  </div>
  <button class="btn-primary shrink-0">Aktion</button>
</div>

<!-- Stat-Karten -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="card">...</div>
</div>

<!-- Tabelle mit Scroll -->
<div class="card !p-0 overflow-hidden overflow-x-auto">
  <table class="w-full text-sm min-w-[640px]">
    <thead>...</thead>
    <tbody>...</tbody>
  </table>
</div>
```

---

## 10. Automatisches App-Deployment

Das Portal unterstuetzt automatisches Deployment externer Apps als Docker-Container. Apps koennen ueber den App-Store installiert und direkt aus der Oberflaeche deployed werden.

### 10.1 Architektur

Das Backend verwaltet Docker-Container ueber den Docker-Socket (Sibling-Container-Pattern):

```
┌─────────────────────────────────────────────────┐
│  Host-System                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ frontend │  │ backend  │  │ postgres │       │
│  │ :4200/80 │  │ :8080    │  │ :5432    │       │
│  └──────────┘  └────┬─────┘  └──────────┘       │
│                     │ Docker Socket               │
│                     ▼                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ App A    │  │ App B    │  │ App C    │       │
│  │ :49001   │  │ :49002   │  │ :49003   │       │
│  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

Das Backend hat Zugriff auf `/var/run/docker.sock` und nutzt die Docker CLI (`docker pull`, `docker build`, `docker run`, etc.) um App-Container zu verwalten.

### 10.2 portal-app.yaml Manifest

Jede deploybare App kann eine `portal-app.yaml` im Repository-Root bereitstellen. Das Portal liest diese Datei beim Deployment automatisch aus.

```yaml
# App-Metadaten (optional, ueberschreibt DB-Eintraege wenn gesetzt)
name: Meine Beispiel-App
version: 1.0.0
description: Eine Beispielanwendung fuer das Health Portal

# Option 1: Pre-built Docker Image (empfohlen fuer Produktion)
# Wenn gesetzt, wird das Image aus der Registry gezogen statt lokal gebaut.
# image: ghcr.io/meine-firma/meine-app:latest

# Option 2: Lokaler Build aus Dockerfile (Standard wenn kein image gesetzt)
dockerfile: Dockerfile

# Port auf dem die App im Container lauscht
port: 80

# Umgebungsvariablen fuer den Container
env:
  NODE_ENV: production
  API_URL: http://portal-backend:8080/api

# Health-Check Endpunkt (optional)
healthCheck: /health
```

**Manifest-Felder:**

| Feld          | Typ    | Pflicht | Beschreibung                                        |
|---------------|--------|---------|-----------------------------------------------------|
| `name`        | String | Nein    | App-Name (ueberschreibt DB-Wert)                    |
| `version`     | String | Nein    | App-Version (ueberschreibt DB-Wert)                 |
| `description` | String | Nein    | App-Beschreibung                                    |
| `image`       | String | Nein*   | Docker Image aus Registry (z.B. `ghcr.io/...`)      |
| `dockerfile`  | String | Nein*   | Pfad zum Dockerfile fuer lokalen Build               |
| `port`        | Number | Nein    | Container-Port (Standard: 80)                        |
| `env`         | Map    | Nein    | Umgebungsvariablen als Key-Value-Paare               |
| `healthCheck` | String | Nein    | Health-Check Endpunkt (z.B. `/health`)               |

\* Entweder `image` oder `dockerfile` muss gesetzt sein. Wenn keines angegeben ist, wird `Dockerfile` im Repository-Root gesucht.

### 10.3 Deployment-Ablauf

1. **Benutzer klickt "Deployen"** in der App-Detail-Seite oder unter "Installierte Apps"
2. **Backend klont das Repository** (wenn `repositoryUrl` gesetzt) nach `/tmp/portal-deployments/`
3. **Manifest wird gelesen** (`portal-app.yaml` im Repository-Root)
4. **Docker Image wird bereitgestellt:**
   - Bei `image`: `docker pull <image>`
   - Bei `dockerfile`: `docker build -t portal-app-<id> -f <dockerfile> .`
5. **Container wird gestartet:** `docker run` mit automatischer Port-Zuweisung
6. **Container wird ins Portal-Netzwerk eingebunden** (`portalcore_default`)
7. **Status wird aktualisiert:** `applicationUrl`, `containerPort`, `deployStatus`

### 10.4 Deployment-API

```
POST /api/deployments/{installedAppId}/deploy       -- Asynchrones Deployment
POST /api/deployments/{installedAppId}/deploy-sync   -- Synchrones Deployment
POST /api/deployments/{installedAppId}/undeploy      -- Container stoppen/entfernen
GET  /api/deployments/{installedAppId}/status        -- Deployment-Status abfragen
```

**Deploy-Status-Werte:**

| Status      | Beschreibung                          |
|-------------|---------------------------------------|
| `PENDING`   | Installiert, noch nicht deployed       |
| `DEPLOYING` | Deployment laeuft (Build/Pull/Start)   |
| `RUNNING`   | Container laeuft                       |
| `STOPPED`   | Container gestoppt                     |
| `FAILED`    | Deployment fehlgeschlagen              |

### 10.5 Docker-Konfiguration

In `docker-compose.yml` muessen folgende Volumes fuer das Backend konfiguriert sein:

```yaml
backend:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock     # Docker-Socket
    - /tmp/portal-deployments:/tmp/portal-deployments  # Build-Workspace
```

Das Backend-Dockerfile installiert Docker CLI und Git:
```dockerfile
RUN apk add --no-cache docker-cli git
```

### 10.6 Manuelles Deployment (Alternative)

Alternativ kann eine App auch manuell als Container in `docker-compose.yml` hinzugefuegt werden:

```yaml
meine-app:
  build: ./pfad-zum-repo
  container_name: portal-meine-app
  ports:
    - "4300:80"
  depends_on:
    - backend
```

### 10.7 App im Portal registrieren

Per REST API:
```bash
curl -X POST http://localhost:8080/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "id": "meine-neue-app",
    "name": "Meine Neue App",
    "shortDescription": "Kurze Beschreibung der App",
    "longDescription": "Ausfuehrliche Beschreibung...",
    "category": "VERWALTUNG",
    "marketSegment": "KOSTENTRAEGER",
    "appType": "ANWENDUNG",
    "vendor": "DRITTANBIETER",
    "vendorName": "Meine Firma GmbH",
    "version": "1.0.0",
    "iconColor": "#006EC7",
    "iconInitials": "MA",
    "price": "kostenlos",
    "repositoryUrl": "https://github.com/meine-firma/meine-app"
  }'
```

### 10.8 App installieren und deployen

```bash
# 1. App fuer Mandant installieren
curl -X POST http://localhost:8080/api/tenants/t-aok-nw/installed-apps \
  -H "Content-Type: application/json" \
  -d '{ "appId": "meine-neue-app" }'

# 2. App deployen (mit der installedApp-ID aus Schritt 1)
curl -X POST http://localhost:8080/api/deployments/{installedAppId}/deploy

# 3. Status abfragen
curl http://localhost:8080/api/deployments/{installedAppId}/status
```

Nach Installation erscheint die App automatisch in der Sidebar unter **"Installierte Anwendungen"**. Nach erfolgreichem Deployment kann sie direkt geoeffnet werden.

---

## 11. Checkliste fuer neue Apps

### Pflicht
- [ ] App-ID ist eindeutig und im kebab-case Format
- [ ] Alle Pflichtfelder (name, category, market_segment, app_type, vendor, price) sind gesetzt
- [ ] `icon_color` (Hex) und `icon_initials` (2 Buchstaben) sind definiert
- [ ] Entweder `route` (intern) oder `repository_url`/`application_url` (extern) ist gesetzt
- [ ] Die App ist responsive und auf iPhone nutzbar (Mobile-First)
- [ ] Schriftarten Fira Sans / Fira Sans Condensed werden verwendet
- [ ] Das Farbschema des Portals wird eingehalten (Primary: #006EC7)
- [ ] Tailwind CSS Utility-Klassen werden konsistent verwendet
- [ ] Deutsche Benutzeroberflaechensprache (de-DE)
- [ ] Dark Mode wird unterstuetzt (`dark:` Klassen oder `.dark` Abfrage)

### Empfohlen
- [ ] `shortDescription` und `longDescription` sind gepflegt
- [ ] `version` folgt SemVer (z.B. 1.0.0)
- [ ] `tags` fuer Suchfunktion im App-Store sind gesetzt
- [ ] `compatibility` listet unterstuetzte Systeme auf
- [ ] `repositoryUrl` verweist auf das Git-Repository
- [ ] `portal-app.yaml` Manifest im Repository-Root vorhanden
- [ ] Eigene REST-Endpunkte folgen dem bestehenden Controller-Pattern
- [ ] Flyway-Migration fuer eigene Datenbanktabellen vorhanden
- [ ] CSS-Klassen `.card`, `.btn-primary`, `.badge` etc. werden genutzt

### Fuer deploybare externe Apps zusaetzlich
- [ ] `portal-app.yaml` mit `image` oder `dockerfile` konfiguriert
- [ ] `port` im Manifest entspricht dem tatsaechlichen Container-Port
- [ ] Container startet ohne manuelle Konfiguration
- [ ] Health-Check Endpunkt (`healthCheck`) ist definiert

### Fuer interne Angular-Apps zusaetzlich
- [ ] Standalone Component mit Inline-Template
- [ ] Route in `app.routes.ts` eingetragen (Lazy Loading)
- [ ] Angular Signals fuer State Management (kein RxJS fuer lokalen State)
- [ ] `PortalStateService` fuer Mandant, Theme und User genutzt
- [ ] API-Service-Klasse nach bestehendem Pattern erstellt

---

## 12. Referenz-Dateien im Repository

| Datei                                              | Inhalt                              |
|----------------------------------------------------|-------------------------------------|
| `docker-compose.yml`                               | Container-Konfiguration             |
| `portal-app.example.yaml`                          | Beispiel-Manifest fuer App-Deployment |
| `portal-init.example.yml`                          | Beispiel-Konfiguration fuer Ersteinrichtung |
| `backend/src/main/resources/application.yml`       | Backend-Konfiguration               |
| `backend/src/main/resources/db/migration/V1-V13__*.sql` | Datenbank-Migrationen (13 Versionen) |
| `backend/src/main/java/de/portalcore/entity/PortalApp.java` | App-Entity                 |
| `backend/src/main/java/de/portalcore/entity/InstalledApp.java` | Installation-Entity      |
| `backend/src/main/java/de/portalcore/entity/NachrichtItem.java` | Nachricht/Aufgabe Entity (mit Unteraufgaben) |
| `backend/src/main/java/de/portalcore/entity/NachrichtEmpfaenger.java` | Empfaenger-Zuordnung (gelesen/archiviert/erledigt) |
| `backend/src/main/java/de/portalcore/entity/NachrichtAnhang.java` | Dateianhang Entity |
| `backend/src/main/java/de/portalcore/entity/WidgetDefinition.java` | Widget-Katalog Entity |
| `backend/src/main/java/de/portalcore/entity/DashboardWidget.java` | Benutzer-Dashboard-Widget |
| `backend/src/main/java/de/portalcore/entity/PortalSeite.java` | Portal-Seiten fuer Quicklinks |
| `backend/src/main/java/de/portalcore/service/NachrichtService.java` | Nachrichtencenter-Logik |
| `backend/src/main/java/de/portalcore/service/DashboardService.java` | Dashboard-Widget-Logik |
| `backend/src/main/java/de/portalcore/service/DeploymentService.java` | Docker-Deployment-Logik |
| `backend/src/main/java/de/portalcore/controller/NachrichtController.java` | Nachrichtencenter-API |
| `backend/src/main/java/de/portalcore/controller/DashboardController.java` | Dashboard-API |
| `backend/src/main/java/de/portalcore/controller/DeploymentController.java` | Deployment-API |
| `backend/src/main/java/de/portalcore/controller/AppController.java` | App-API             |
| `backend/src/main/java/de/portalcore/enums/`       | Alle Enum-Werte (17 Enums)          |
| `frontend/src/app/models/nachricht.model.ts`       | Nachricht-TypeScript-Modelle        |
| `frontend/src/app/models/dashboard.model.ts`       | Dashboard-TypeScript-Modelle        |
| `frontend/src/app/models/app.model.ts`             | App-TypeScript-Modelle              |
| `frontend/src/app/services/nachricht.service.ts`   | Nachrichtencenter-Service           |
| `frontend/src/app/services/dashboard.service.ts`   | Dashboard-Service                   |
| `frontend/src/app/services/app.service.ts`         | App-Service                         |
| `frontend/src/app/services/installed-app.service.ts`| Installations-Service              |
| `frontend/src/app/services/deployment.service.ts`  | Deployment-Service (Frontend)       |
| `frontend/src/app/services/portal-state.service.ts`| Globaler State                      |
| `frontend/src/app/pages/nachrichtencenter/`        | Nachrichtencenter-UI (3-Panel)      |
| `frontend/src/app/pages/dashboard/`                | Konfigurierbares Widget-Dashboard   |
| `frontend/src/app/layout/sidebar.component.*`      | Sidebar mit installierten Apps      |
| `frontend/src/app/app.routes.ts`                   | Routing-Konfiguration               |
| `frontend/tailwind.config.ts`                      | Tailwind Design-Tokens              |
| `frontend/src/styles.scss`                         | Globale CSS-Klassen                 |
