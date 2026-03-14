# CLAUDE.md - Health Portal (PortalCore)

## Projekt-Ueberblick

Multi-Tenant Health Portal fuer deutsche Gesundheitsorganisationen.

| Layer    | Technologie                         | Verzeichnis  |
|----------|-------------------------------------|--------------|
| Frontend | Angular 18 + Tailwind CSS 3         | `frontend/`  |
| Backend  | Spring Boot 3 + Java 21 + Maven     | `backend/`   |
| DB       | PostgreSQL 16                        | via Docker   |

---

## Befehle

```bash
# Frontend
cd frontend && npm install && npm start       # Dev-Server (Port 4200)
cd frontend && npm run build                  # Prod-Build
cd frontend && npm test                       # Unit-Tests

# Backend
cd backend && ./mvnw spring-boot:run          # Dev-Server (Port 8080)
cd backend && ./mvnw test                     # Unit-Tests
cd backend && ./mvnw package                  # JAR bauen

# Docker
docker-compose up -d                          # Alle Services starten
```

---

## Projektstruktur

```
frontend/src/app/
  layout/           # Header, Sidebar, Portal-Layout
  pages/            # Feature-Seiten (je ein Standalone Component)
  models/           # TypeScript Interfaces
  services/         # Angular Services (HTTP-Kommunikation)
  interceptors/     # Auth-Interceptor
  app.routes.ts     # Routing-Konfiguration
  app.config.ts     # App-Konfiguration

backend/src/main/java/de/portalcore/
  controller/       # REST-Controller
  repository/       # JPA Repositories
  config/           # Security, CORS, JWT
```

---

## Code-Konventionen

### Allgemein

- Sprache im Code: Deutsch fuer Fachbegriffe und UI-Texte, Englisch fuer technische Konstrukte
- Keine Umlaute in Bezeichnern: `ue` statt `ue`, `ae` statt `ae`, `oe` statt `oe`, `ss` statt `ss`
- Kein toter Code, keine auskommentierten Bloecke
- Keine Dateien erstellen, wenn bestehende erweitert werden koennen
- Keine ueberfluessigen Abstraktionen oder Wrapper fuer einmalige Operationen

### Frontend (Angular + TypeScript)

- **Standalone Components** verwenden (keine NgModules)
- **Angular Signals** fuer reaktiven State (`signal()`, `computed()`)
- **Inline Templates** fuer Components (kein separates HTML-File)
- Imports: `CommonModule`, `FormsModule` direkt im Component
- Styling: **Tailwind CSS Utility-Klassen**, keine separaten CSS-Dateien
- Design-System-Farben aus `tailwind.config.ts` verwenden:
  - Primary: `primary`, `primary-dark`, `primary-light`
  - Status: `success`, `warning`, `error`, `info`
  - Grau: `gray-50` bis `gray-950`
  - Akzent: `accent-turquoise`, `accent-orange`, `accent-pink`, `accent-violet`
- Shadow: `shadow-card` fuer Karten, `shadow-modal` fuer Modals
- Schrift: `font-sans` (Fira Sans), `font-condensed` (Fira Sans Condensed) fuer Ueberschriften
- Dark Mode: via `darkMode: 'class'` in Tailwind-Config
- Interfaces in `models/`-Verzeichnis definieren
- Services in `services/`-Verzeichnis, ein Service pro Fachbereich
- Kein `any` verwenden - immer typisierte Interfaces
- Control Flow: `@if`, `@for`, `@switch` (neue Angular-Syntax, kein `*ngIf`/`*ngFor`)

### Backend (Java + Spring Boot)

- **Java 21** Features nutzen (Records, Pattern Matching, Text Blocks)
- REST-Controller unter `/api` Praefix
- DTOs fuer Request/Response, keine Entities direkt exponieren
- JPA Repositories im `repository/`-Paket
- Validierung mit `spring-boot-starter-validation` Annotationen
- Security via JWT (`JwtAuthenticationFilter`)
- Flyway fuer Datenbank-Migrationen
- Keine Business-Logik in Controllern - Services nutzen

### Datenbank

- Tabellennamen: `snake_case` (z.B. `portal_apps`)
- Migrationen: Flyway im Backend (`db/migration/`)
- Multi-Tenant: Daten immer mit `tenant_id` filtern

---

## Git-Konventionen

- Commit-Messages: kurz, auf Deutsch oder Englisch, im Imperativ
- Feature-Branches: `claude/<feature>-<id>` oder `feature/<name>`
- Keine Secrets committen (`.env`, Credentials)
- `.gitignore` beachten

---

## Architektur-Regeln

1. **Frontend-Backend-Trennung**: Frontend kommuniziert ausschliesslich ueber REST API (`/api`)
2. **Multi-Tenant**: Jede Datenanfrage muss Mandant-bezogen sein
3. **Keine externen UI-Libraries** ausser Tailwind CSS und Lucide Icons (`lucide-angular`)
4. **Standalone Components**: Jede Seite ist ein eigenstaendiger Angular Standalone Component
5. **Lazy Loading**: Seiten-Components werden per Route lazy geladen
6. **Mock-Daten** sind erlaubt fuer Prototyping, muessen aber klar als solche erkennbar sein
7. **Kein Over-Engineering**: Minimale Loesung bevorzugen, keine hypothetischen Erweiterungen einbauen
