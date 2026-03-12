# Health Portal

Multi-tenant SPA platform for German healthcare organizations (Kassenaerztliche Vereinigungen, Kostentraeger, Krankenhaeuser).

## Tech Stack

- **Backend:** Spring Boot 3.2, Java 21, PostgreSQL 16, Flyway
- **Frontend:** Angular 18, Tailwind CSS, Lucide Icons
- **Database:** PostgreSQL with Flyway migrations

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

## Project Structure

```
backend/
  src/main/java/de/portalcore/
    entity/         - JPA Entities
    enums/          - Enumerations
    repository/     - Spring Data Repositories
    service/        - Business Logic
    controller/     - REST Controllers
    config/         - Security & CORS Configuration
  src/main/resources/
    db/migration/   - Flyway SQL Migrations
    application.yml - Application Configuration

frontend/
  src/app/
    models/         - TypeScript Interfaces
    services/       - Angular Services (HTTP)
    layout/         - Sidebar, Header, PortalLayout
    pages/          - Page Components
      dashboard/    - Dashboard with Widgets
      appstore/     - App Marketplace
      messages/     - Messaging System
      users/        - User & Role Management (RBAC)
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
```

## Features

- App Marketplace (AppStore) with market segments, categories, installation
- Dashboard with widgets for installed apps
- User & Role Management (RBAC) with 31 permissions
- Parameter configuration per app with audit log
- Task assignment with rule-based matching (IK, PLZ, etc.)
- Batch job management with queue and protocol
- Messaging/communication system
- Domain apps: Arztregister, WB-Foerderung, smile KH, KV AI Abrechnung

## Design System

Custom design system:
- Primary: `#006EC7`
- Neutral: `#887D75` (warm gray scale)
- Fonts: Fira Sans / Fira Sans Condensed
- Dark Mode support
