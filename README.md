# Health Portal

Multi-tenant SPA platform for German healthcare organizations (Kassenaerztliche Vereinigungen, Kostentraeger, Krankenhaeuser).

## Tech Stack

- **Backend:** Spring Boot 3.2, Java 21, PostgreSQL 16, Flyway
- **Frontend:** Angular 18, Tailwind CSS 3, Lucide Icons
- **Auth:** JWT with OTP-based login (no passwords)
- **Database:** PostgreSQL with Flyway migrations (V1-V13)

## Prerequisites

- Java 21+
- Node.js 22+
- Docker & Docker Compose (for PostgreSQL)

## Getting Started

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080/api`.

### 3. Start Frontend

```bash
cd frontend
npm install
ng serve --proxy-config proxy.conf.json
```

The app runs at `http://localhost:4200`.

### 4. Initial Setup

On first start, the portal requires initial configuration via `portal-init.example.yml`:

- Super-Admin user (name, email)
- SMTP/IMAP/POP3 email configuration
- OTP authentication settings
- Default tenant

## E-Mail-Konfiguration bei der Erstinstallation

Das Portal verwendet E-Mail fuer die OTP-basierte Authentifizierung. Ohne korrekte SMTP-Konfiguration koennen sich Benutzer nicht einloggen.

### Variante 1: portal-init.yml (empfohlen fuer Erstinstallation)

Beim ersten Start liest das Backend die Datei `portal-init.yml` und setzt alle Parameter automatisch.

**Schritt 1:** Erstellen Sie die Konfigurationsdatei:

```bash
cp portal-init.example.yml portal-init.yml
```

**Schritt 2:** Passen Sie die Werte an Ihre Organisation an:

```yaml
# portal-init.yml

# Super-User fuer die Erstinstallation
superUser:
  vorname: Max
  nachname: Mustermann
  email: admin@meine-organisation.de
  tenantId: t-aok-nw

# Parameter-Werte (nur leere Werte werden ueberschrieben)
parameters:
  # SMTP-Konfiguration (Postausgang) -- PFLICHT fuer Login
  portal.email.smtp.host: smtp.meine-organisation.de
  portal.email.smtp.port: "587"
  portal.email.smtp.username: portal@meine-organisation.de
  portal.email.smtp.password: "mein-passwort"
  portal.email.smtp.auth: "true"
  portal.email.smtp.starttls: "true"
  portal.email.smtp.ssl: "false"
  portal.email.from: portal@meine-organisation.de

  # IMAP-Konfiguration (optional, fuer Posteingang)
  portal.email.imap.host: imap.meine-organisation.de
  portal.email.imap.port: "993"
  portal.email.imap.username: portal@meine-organisation.de
  portal.email.imap.password: "mein-passwort"
  portal.email.imap.ssl: "true"
  portal.email.imap.enabled: "false"

  # POP3-Konfiguration (alternativ zu IMAP, optional)
  portal.email.pop3.host: pop3.meine-organisation.de
  portal.email.pop3.port: "995"
  portal.email.pop3.username: portal@meine-organisation.de
  portal.email.pop3.password: "mein-passwort"
  portal.email.pop3.ssl: "true"
  portal.email.pop3.enabled: "false"

  # OTP-Einstellungen
  portal.auth.email.enabled: "true"
  portal.auth.otp.length: "6"
  portal.auth.otp.expiration-minutes: "10"
  portal.auth.otp.max-attempts: "5"
  portal.auth.otp.rate-limit: "5"
```

**Schritt 3a — Lokale Entwicklung:** Datei nach `backend/src/main/resources/portal-init.yml` kopieren:

```bash
cp portal-init.yml backend/src/main/resources/portal-init.yml
```

**Schritt 3b — Docker:** Als Volume mounten in `docker-compose.yml`:

```yaml
backend:
  volumes:
    - ./portal-init.yml:/app/config/portal-init.yml:ro
```

**Schritt 4:** Starten Sie das Portal. Beim ersten Start werden:
1. Der Super-User angelegt (falls noch nicht vorhanden)
2. Alle leeren Parameter mit den Werten aus der Datei befuellt
3. SMTP wird konfiguriert und OTP-Versand funktioniert

> **Wichtig:** Parameter werden nur gesetzt wenn ihr aktueller Wert leer ist. Bereits konfigurierte Parameter werden nicht ueberschrieben. Das ist sicher fuer Neustart/Re-Deployment.

### Variante 2: Umgebungsvariablen (Fallback)

Alternativ koennen SMTP-Einstellungen ueber Umgebungsvariablen in `application.yml` konfiguriert werden:

```bash
MAIL_HOST=smtp.meine-organisation.de
MAIL_PORT=587
MAIL_USERNAME=portal@meine-organisation.de
MAIL_PASSWORD=mein-passwort
MAIL_AUTH=true
MAIL_STARTTLS=true
MAIL_FROM=portal@meine-organisation.de
OTP_SEND_MAIL=true
```

In `docker-compose.yml`:

```yaml
backend:
  environment:
    DB_HOST: postgres
    MAIL_HOST: smtp.meine-organisation.de
    MAIL_PORT: 587
    MAIL_USERNAME: portal@meine-organisation.de
    MAIL_PASSWORD: mein-passwort
    MAIL_AUTH: true
    MAIL_STARTTLS: true
    MAIL_FROM: portal@meine-organisation.de
    OTP_SEND_MAIL: true
```

> **Hinweis:** Die Datenbank-Parameter (portal-init.yml / Admin-UI) haben Vorrang vor den Umgebungsvariablen. Der `EmailConfigService` liest immer zuerst aus der DB.

### Variante 3: Admin-Oberflaeche (nach Erstinstallation)

Nach der Erstinstallation koennen alle E-Mail-Parameter ueber die Admin-Oberflaeche konfiguriert werden:

1. Einloggen als Super-Admin
2. Navigieren zu **Parameter** (Seitenleiste)
3. Filtern nach App "Portal" und Gruppe "Email"
4. SMTP-Host, -Port, -Benutzername, -Passwort etc. eintragen
5. Aenderungen werden sofort wirksam (`hot_reload` fuer die meisten Parameter)

Alle Aenderungen werden im Audit-Log protokolliert (wer, wann, alter/neuer Wert).

### SMTP-Konfigurationsbeispiele

**Microsoft 365 / Office 365:**
```yaml
portal.email.smtp.host: smtp.office365.com
portal.email.smtp.port: "587"
portal.email.smtp.auth: "true"
portal.email.smtp.starttls: "true"
portal.email.smtp.ssl: "false"
```

**Google Workspace (Gmail):**
```yaml
portal.email.smtp.host: smtp.gmail.com
portal.email.smtp.port: "587"
portal.email.smtp.auth: "true"
portal.email.smtp.starttls: "true"
portal.email.smtp.ssl: "false"
```

**Eigener Mailserver (SSL/TLS auf Port 465):**
```yaml
portal.email.smtp.host: mail.meine-organisation.de
portal.email.smtp.port: "465"
portal.email.smtp.auth: "true"
portal.email.smtp.starttls: "false"
portal.email.smtp.ssl: "true"
```

**Lokale Entwicklung (ohne echten Mailserver):**

Fuer lokale Entwicklung kann [MailHog](https://github.com/mailhog/MailHog) oder [Mailpit](https://github.com/axllent/mailpit) verwendet werden:

```yaml
portal.email.smtp.host: localhost
portal.email.smtp.port: "1025"
portal.email.smtp.auth: "false"
portal.email.smtp.starttls: "false"
portal.email.smtp.ssl: "false"
```

Oder OTP-Versand deaktivieren (Code wird im Backend-Log ausgegeben):
```bash
OTP_SEND_MAIL=false
```

### Alle E-Mail-Parameter

| Parameter-Key | Beschreibung | Typ | Standard |
|---------------|--------------|-----|----------|
| `portal.email.smtp.host` | SMTP-Server Hostname | STRING | _(leer)_ |
| `portal.email.smtp.port` | SMTP-Port | NUMBER | `587` |
| `portal.email.smtp.username` | SMTP-Benutzername | STRING | _(leer)_ |
| `portal.email.smtp.password` | SMTP-Passwort | PASSWORD | _(leer)_ |
| `portal.email.smtp.auth` | SMTP-Authentifizierung aktivieren | BOOLEAN | `false` |
| `portal.email.smtp.starttls` | STARTTLS aktivieren (Port 587) | BOOLEAN | `false` |
| `portal.email.smtp.ssl` | SSL/TLS aktivieren (Port 465) | BOOLEAN | `false` |
| `portal.email.from` | Absender-E-Mail-Adresse | EMAIL | `noreply@health-portal.de` |
| `portal.email.imap.host` | IMAP-Server Hostname | STRING | _(leer)_ |
| `portal.email.imap.port` | IMAP-Port | NUMBER | `993` |
| `portal.email.imap.username` | IMAP-Benutzername | STRING | _(leer)_ |
| `portal.email.imap.password` | IMAP-Passwort | PASSWORD | _(leer)_ |
| `portal.email.imap.ssl` | IMAP SSL/TLS aktivieren | BOOLEAN | `true` |
| `portal.email.imap.enabled` | IMAP-Posteingang aktivieren | BOOLEAN | `false` |
| `portal.email.pop3.host` | POP3-Server Hostname | STRING | _(leer)_ |
| `portal.email.pop3.port` | POP3-Port | NUMBER | `995` |
| `portal.email.pop3.username` | POP3-Benutzername | STRING | _(leer)_ |
| `portal.email.pop3.password` | POP3-Passwort | PASSWORD | _(leer)_ |
| `portal.email.pop3.ssl` | POP3 SSL/TLS aktivieren | BOOLEAN | `true` |
| `portal.email.pop3.enabled` | POP3-Posteingang aktivieren | BOOLEAN | `false` |
| `portal.auth.email.enabled` | OTP per E-Mail aktivieren | BOOLEAN | `true` |
| `portal.auth.otp.length` | Anzahl Stellen OTP-Code | NUMBER | `6` |
| `portal.auth.otp.expiration-minutes` | Gueltigkeit OTP in Minuten | NUMBER | `10` |
| `portal.auth.otp.max-attempts` | Max. Fehlversuche OTP | NUMBER | `5` |
| `portal.auth.otp.rate-limit` | Max. OTP-Anfragen pro Stunde | NUMBER | `5` |

### Ablauf der Initialisierung

```
Applikationsstart
  └── PortalInitService.run()
      ├── Sucht portal-init.yml:
      │   1. /app/config/portal-init.yml (Docker-Volume)
      │   2. classpath:portal-init.yml (im JAR)
      ├── Super-User anlegen (falls E-Mail noch nicht existiert)
      │   └── Erstellt PortalUser + UserTenant + superAdmin=true
      └── Parameter setzen (nur leere Parameter werden befuellt)
          └── SMTP, IMAP, POP3, OTP aus YAML in portal_parameters

Login-Flow:
  1. Benutzer gibt E-Mail ein
  2. Backend generiert OTP-Code (OtpService)
  3. EmailConfigService liest SMTP-Daten aus portal_parameters
  4. OTP wird per E-Mail versendet (oder in Log ausgegeben falls OTP_SEND_MAIL=false)
  5. Benutzer gibt OTP ein → JWT-Token wird ausgestellt
```

## Project Structure

```
backend/
  src/main/java/de/portalcore/
    entity/         - JPA Entities (32 entities)
    enums/          - Enumerations (17 enums)
    repository/     - Spring Data Repositories
    service/        - Business Logic
    controller/     - REST Controllers (20 controllers)
    config/         - Security, JWT, CORS Configuration
  src/main/resources/
    db/migration/   - Flyway SQL Migrations (V1-V13)
    application.yml - Application Configuration

frontend/
  src/app/
    models/         - TypeScript Interfaces
    services/       - Angular Services (HTTP)
    layout/         - Sidebar, Header, PortalLayout
    pages/          - Page Components
      dashboard/    - Configurable Widget Dashboard
      appstore/     - App Marketplace
      nachrichtencenter/ - Nachrichtencenter (Messages & Tasks)
      messages/     - System Notifications
      users/        - User & Role Management (RBAC)
      gruppen/      - Group & Permission Management
      mandanten/    - Tenant Management
      parameter/    - Parameter Configuration
      aufgabensteuerung/ - Task Assignment Rules
      batch-jobs/   - Batch Job Management
      arztregister/ - Doctor Registry (5-Step Wizard)
      wb-foerderung/- Training Funding Management
      cms/          - Content Management
      forms/        - Form Designer
      ai-agents/    - AI Agent Management
      admin/        - Administration
      settings/     - User Settings
      login/        - OTP Login
      iframe/       - App iFrame Container
```

## Features

### Core Platform
- **Multi-Tenant Architecture** with tenant-scoped data isolation
- **JWT Authentication** with OTP-based login (no passwords)
- **RBAC** with 31+ permissions and group-based authorization
- **User Management** with addresses, multi-tenant assignment, super-admin support
- **Tenant Management** with extended contact data and address management

### Nachrichtencenter (Messages & Tasks)
- Unified message and task center with email-like 3-panel UI
- **User-to-user internal messaging** (not email)
- **Tasks** assignable to 1+ users with deadlines, reminders, and priority levels
- **Sub-tasks (Unteraufgaben)**: Tasks can be divided into sub-tasks, each assignable to different users with independent deadlines
- Sub-task progress tracking with visual progress bar
- Inbox (Posteingang), Sent (Gesendet), Archive (Archiv) folders
- Compose messages/tasks from anywhere in the portal
- System-generated messages and tasks
- File attachments with BYTEA storage
- Mark as read/unread, archive, mark as done (auto-archives)

### Configurable Dashboard
- **Widget-based dashboard** with 4-column grid layout
- **Drag & drop** widget positioning and **resize** functionality
- **Widget Picker** modal with categories (Portal / Apps / Quicklinks)
- Widget types: ZAHL (counter), LISTE (list), BALKEN (bar chart), TORTE (pie chart), QUICKLINK, TABELLE (table)
- **Posteingang widget**: Scrollable inbox list of open tasks and messages on the dashboard
- **Quicklink widgets** to portal and app pages
- User-individual persistent layout
- Charts rendered with pure CSS (no chart libraries)

### App Marketplace (AppStore)
- App Marketplace with market segments, categories, installation
- Automatic Docker-based deployment from Git repositories
- App menu integration via `portal-app-menu.yaml`
- App-level permissions via `useCases` in `portal-app.yaml`

### Additional Features
- Parameter configuration per app with audit log and tenant isolation
- Task assignment with rule-based matching (IK, PLZ, etc.)
- Batch job management with queue and protocol
- Domain apps: Arztregister, WB-Foerderung, smile KH, KV AI Abrechnung
- Custom theme configuration (colors, fonts, branding)
- Custom menu ordering and menu items

## Database Migrations

| Migration | Description |
|-----------|-------------|
| V1 | Core schema: tenants, users, apps, roles, permissions |
| V2 | Seed data: test tenants, users, apps |
| V3 | App URL fields |
| V4 | Deployment fields for Docker-based deployment |
| V5 | Auth groups and granular permissions |
| V6 | App use cases and super admin |
| V7 | Super user, parameters, audit log |
| V8 | Tenant-scoped parameters |
| V9 | Portal theme and custom menu items |
| V10 | Email configuration and auth toggle |
| V11 | Nachrichtencenter: nachricht_items, nachricht_empfaenger, nachricht_anhaenge |
| V12 | Dashboard widgets: widget_definitionen, dashboard_widgets, portal_seiten |
| V13 | Sub-tasks (parent_id on nachricht_items) and Posteingang dashboard widget |

## REST API Overview

Base URL: `http://<host>:8080/api`

| Controller | Path | Description |
|------------|------|-------------|
| AuthController | `/auth` | OTP login, token refresh, session management |
| UserController | `/users` | User CRUD, profile, addresses |
| TenantController | `/tenants` | Tenant management |
| GruppenController | `/gruppen` | Group & permission management |
| AppController | `/apps` | App catalog CRUD |
| InstalledAppController | `/tenants/{id}/installed-apps` | App installation per tenant |
| DeploymentController | `/deployments` | Docker-based app deployment |
| NachrichtController | `/nachricht` | Nachrichtencenter: messages, tasks, sub-tasks |
| DashboardController | `/dashboard` | Widget catalog, user dashboard, layout |
| ParameterController | `/parameters` | System parameters with audit log |
| AufgabenController | `/aufgaben` | Task assignment rules |
| BatchJobController | `/batch-jobs` | Batch job queue and execution |
| MessageController | `/messages` | System notifications |
| ThemeController | `/theme` | Portal theme configuration |
| PermissionController | `/permissions` | Permission listing |
| RoleController | `/roles` | Role management |

## Design System

Custom design system:
- Primary: `#006EC7`
- Neutral: `#887D75` (warm gray scale)
- Fonts: Fira Sans / Fira Sans Condensed
- Dark Mode support
- CSS Custom Properties for theme integration (`--portal-primary`, etc.)

## Documentation

| File | Description |
|------|-------------|
| `README.md` | Project overview and getting started (this file) |
| `APP_ANFORDERUNGEN.md` | Technical requirements for new apps |
| `APP_ENTWICKLUNG_PROMPT.md` | Comprehensive development guide for new apps |
| `portal-app.example.yaml` | Example app deployment manifest |
| `portal-init.example.yml` | Example portal initialization config |
| `docker-compose.yml` | Docker Compose configuration |
