import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PortalApp, InstalledApp } from '../../models/app.model';
import { AppService } from '../../services/app.service';
import { InstalledAppService } from '../../services/installed-app.service';
import { DeploymentService } from '../../services/deployment.service';
import { PortalStateService } from '../../services/portal-state.service';

@Component({
  selector: 'app-app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Back Button -->
    <a routerLink="/appstore"
       class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      Zurueck zum App-Marktplatz
    </a>

    <div *ngIf="app">
      <!-- App Header -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <!-- Icon -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0"
               [style.background-color]="app.iconColor">
            {{ app.iconInitials }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 class="text-2xl font-bold text-gray-800">{{ app.name }}</h1>
                <p class="text-sm text-gray-500">{{ app.vendorName }}</p>
              </div>
              <span class="px-3 py-1 text-sm font-medium rounded-full shrink-0"
                    [ngClass]="app.price === 'kostenlos'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'">
                {{ app.price === 'kostenlos' ? 'Kostenlos' : 'Lizenzpflichtig' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-4 mb-4">
              <!-- Version -->
              <span class="text-sm text-gray-400">Version {{ app.version }}</span>

              <!-- Rating -->
              <div class="flex items-center gap-1">
                <span *ngFor="let star of [1,2,3,4,5]" class="text-sm"
                      [class.text-yellow-400]="star <= app.rating"
                      [class.text-gray-300]="star > app.rating">&#9733;</span>
                <span class="text-sm text-gray-500 ml-1">{{ app.rating }}</span>
                <span class="text-sm text-gray-400">({{ app.reviewCount }} Bewertungen)</span>
              </div>

              <!-- Install Count -->
              <span class="text-sm text-gray-400">{{ app.installCount }} Installationen</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button *ngIf="!isInstalled"
                      (click)="install()"
                      [disabled]="installing"
                      class="px-6 py-2.5 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors disabled:opacity-50">
                {{ installing ? 'Wird installiert...' : 'Installieren' }}
              </button>
              <ng-container *ngIf="isInstalled">
                <div class="inline-flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Installiert
                </div>
                <button *ngIf="canDeploy()"
                        (click)="deploy()"
                        [disabled]="deploying"
                        class="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {{ deploying ? 'Wird deployed...' : (deployStatus === 'RUNNING' ? 'Redeploy' : 'Deployen') }}
                </button>
                <span *ngIf="deployStatus === 'RUNNING'"
                      class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Container laeuft
                </span>
                <button (click)="uninstall()"
                        [disabled]="uninstalling"
                        class="px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                  {{ uninstalling ? 'Wird deinstalliert...' : 'Deinstallieren' }}
                </button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- URLs & Deployment Info -->
      <div *ngIf="app.repositoryUrl || app.applicationUrl || app.manifestImage" class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Deployment & Links</h2>
        <div class="space-y-2">
          <div *ngIf="app.manifestImage" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 2v20M2 7h5M2 12h5M2 17h5"/>
            </svg>
            <span class="text-gray-500">Docker Image:</span>
            <span class="text-gray-700 font-mono text-xs">{{ app.manifestImage }}</span>
          </div>
          <div *ngIf="app.repositoryUrl" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            <span class="text-gray-500">Repository:</span>
            <span class="text-gray-700">{{ app.repositoryUrl }}</span>
          </div>
          <div *ngIf="app.applicationUrl" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span class="text-gray-500">Anwendung:</span>
            <span class="text-gray-700">{{ app.applicationUrl }}</span>
          </div>
          <div *ngIf="!app.manifestImage && !app.repositoryUrl" class="text-xs text-gray-400 italic">
            Kein Docker Image oder Repository konfiguriert -- Deployment nicht moeglich
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Beschreibung</h2>
        <p class="text-sm text-gray-600 leading-relaxed">{{ app.longDescription }}</p>
      </div>

      <!-- Tags -->
      <div *ngIf="app.tags && app.tags.length > 0" class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Tags</h2>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let tag of app.tags"
                class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Compatibility -->
      <div *ngIf="app.compatibility && app.compatibility.length > 0" class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Kompatibilitaet</h2>
        <ul class="space-y-2">
          <li *ngFor="let compat of app.compatibility" class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ compat }}
          </li>
        </ul>
      </div>

      <!-- Changelog -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Changelog</h2>
        <div class="space-y-4">
          <div *ngFor="let entry of changelog" class="border-l-2 border-gray-200 pl-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold text-gray-800">{{ entry.version }}</span>
              <span class="text-xs text-gray-400">{{ entry.date }}</span>
            </div>
            <ul class="space-y-1">
              <li *ngFor="let change of entry.changes" class="text-sm text-gray-600 flex items-start gap-2">
                <span class="text-gray-300 mt-1 shrink-0">&bull;</span>
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div *ngIf="!app && !loading" class="text-center py-16">
      <p class="text-gray-500 text-sm">App nicht gefunden.</p>
      <a routerLink="/appstore" class="text-[#006EC7] text-sm hover:underline mt-2 inline-block">
        Zurueck zum App-Marktplatz
      </a>
    </div>
  `,
})
export class AppDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appService = inject(AppService);
  private readonly installedAppService = inject(InstalledAppService);
  private readonly deploymentService = inject(DeploymentService);
  private readonly portalState = inject(PortalStateService);

  app: PortalApp | undefined;
  isInstalled = false;
  installing = false;
  uninstalling = false;
  deploying = false;
  deployStatus: string | null = null;
  loading = true;
  changelog: { version: string; date: string; changes: string[] }[] = [];

  private installedAppId: string | null = null;

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('appId');
    if (appId) {
      this.appService.getById(appId).subscribe({
        next: (app) => {
          this.app = app;
          this.changelog = this.generateChangelog(app);
          this.loading = false;
          this.checkInstallStatus(appId);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  private checkInstallStatus(appId: string): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.getAll(tenantId).subscribe({
      next: (installed) => {
        const found = installed.find(i => i.app?.id === appId);
        this.isInstalled = !!found;
        this.installedAppId = found?.id ?? null;
        this.deployStatus = found?.deployStatus ?? null;
      }
    });
  }

  install(): void {
    if (!this.app) return;
    this.installing = true;
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.install(tenantId, this.app.id).subscribe({
      next: (installed) => {
        this.isInstalled = true;
        this.installedAppId = installed.id;
        this.installing = false;
      },
      error: () => {
        this.installing = false;
      }
    });
  }

  uninstall(): void {
    if (!this.app || !this.installedAppId) return;
    this.uninstalling = true;
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.uninstall(tenantId, this.app.id).subscribe({
      next: () => {
        this.isInstalled = false;
        this.installedAppId = null;
        this.uninstalling = false;
      },
      error: () => {
        this.uninstalling = false;
      }
    });
  }

  canDeploy(): boolean {
    return this.isInstalled && !!(this.app?.repositoryUrl || this.app?.manifestImage);
  }

  deploy(): void {
    if (!this.installedAppId) return;
    this.deploying = true;
    this.deploymentService.deploy(this.installedAppId).subscribe({
      next: () => {
        this.deployStatus = 'DEPLOYING';
        this.deploying = false;
        // Poll for completion
        const interval = setInterval(() => {
          this.deploymentService.getStatus(this.installedAppId!).subscribe({
            next: (status) => {
              this.deployStatus = status.deployStatus;
              if (status.deployStatus !== 'DEPLOYING') {
                clearInterval(interval);
                // Reload app to get updated applicationUrl
                if (this.app) {
                  this.appService.getById(this.app.id).subscribe(a => this.app = a);
                }
              }
            },
            error: () => clearInterval(interval)
          });
        }, 3000);
      },
      error: () => {
        this.deploying = false;
      }
    });
  }

  private generateChangelog(app: PortalApp): { version: string; date: string; changes: string[] }[] {
    return [
      {
        version: app.version,
        date: '2026-02-15',
        changes: [
          'Performance-Optimierungen im Dashboard',
          'Fehlerbehebung bei der Datenexportfunktion',
          'Verbesserte Barrierefreiheit gemaess WCAG 2.1',
        ],
      },
      {
        version: this.decrementVersion(app.version),
        date: '2025-12-01',
        changes: [
          'Neues Benutzerinterface mit verbesserter Navigation',
          'Erweiterte Filterfunktionen',
          'Integration mit dem Portal-Benachrichtigungssystem',
        ],
      },
      {
        version: this.decrementVersion(this.decrementVersion(app.version)),
        date: '2025-09-10',
        changes: [
          'Initiale Veroeffentlichung im Health Portal',
          'Grundlegende Funktionalitaet implementiert',
        ],
      },
    ];
  }

  private decrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    if (parts[2] > 0) {
      parts[2]--;
    } else if (parts[1] > 0) {
      parts[1]--;
      parts[2] = 0;
    } else if (parts[0] > 0) {
      parts[0]--;
      parts[1] = 0;
      parts[2] = 0;
    }
    return parts.join('.');
  }
}
