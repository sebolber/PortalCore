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
