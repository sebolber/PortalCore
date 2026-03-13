import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstalledApp } from '../../models/app.model';
import { InstalledAppService } from '../../services/installed-app.service';
import { DeploymentService } from '../../services/deployment.service';
import { PortalStateService } from '../../services/portal-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-installed-apps',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Installierte Apps</h1>
        <p class="text-sm text-gray-500 mt-1">{{ apps.length }} Apps installiert</p>
      </div>
      <a routerLink="/appstore"
         class="px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors text-center sm:text-left shrink-0">
        Weitere Apps entdecken
      </a>
    </div>

    <!-- App Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let installed of apps" class="card">
        <!-- App Header -->
        <div class="flex items-start gap-3 mb-4">
          <a [routerLink]="'/appstore/' + installed.app?.id"
             class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 hover:opacity-80 transition-opacity"
             [style.background-color]="installed.app?.iconColor || '#006EC7'">
            {{ installed.app?.iconInitials || '?' }}
          </a>
          <div class="flex-1 min-w-0">
            <a [routerLink]="'/appstore/' + installed.app?.id"
               class="text-sm font-semibold text-gray-800 hover:text-[#006EC7] transition-colors truncate block">
              {{ installed.app?.name || 'Unbekannte App' }}
            </a>
            <p class="text-xs text-gray-400">{{ installed.app?.vendorName || '' }}</p>
          </div>
          <!-- Deploy Status Badge -->
          <span class="px-2.5 py-0.5 text-[10px] font-medium rounded-full shrink-0"
                [ngClass]="getDeployBadgeClass(installed)">
            {{ getDeployLabel(installed) }}
          </span>
        </div>

        <!-- Details -->
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Version</span>
            <span class="text-gray-700 font-medium">{{ installed.app?.version || '-' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Installiert am</span>
            <span class="text-gray-700">{{ formatDate(installed.installedAt) }}</span>
          </div>
          <div *ngIf="installed.containerPort" class="flex justify-between text-xs">
            <span class="text-gray-400">Container-Port</span>
            <span class="text-gray-700 font-mono">{{ installed.containerPort }}</span>
          </div>
          <div *ngIf="installed.app?.repositoryUrl" class="flex justify-between text-xs">
            <span class="text-gray-400">Repository</span>
            <span class="text-gray-700 truncate ml-4">{{ installed.app?.repositoryUrl }}</span>
          </div>
          <div *ngIf="installed.app?.manifestImage" class="flex justify-between text-xs">
            <span class="text-gray-400">Image</span>
            <span class="text-gray-700 truncate ml-4 font-mono">{{ installed.app?.manifestImage }}</span>
          </div>
        </div>

        <!-- Deploy Log (collapsible) -->
        <div *ngIf="expandedLogId === installed.id && installed.deployLog"
             class="mb-4 p-3 bg-gray-900 rounded-lg overflow-x-auto">
          <pre class="text-[11px] text-green-400 font-mono whitespace-pre-wrap">{{ installed.deployLog }}</pre>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <!-- Deploy / Redeploy -->
          <button *ngIf="canDeploy(installed)"
                  (click)="deployApp(installed)"
                  [disabled]="deployingId === installed.id"
                  class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center disabled:opacity-50"
                  [ngClass]="installed.deployStatus === 'RUNNING'
                    ? 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'">
            {{ getDeployButtonLabel(installed) }}
          </button>

          <!-- Open App -->
          <a *ngIf="installed.deployStatus === 'RUNNING' && installed.app?.applicationUrl"
             [href]="installed.app?.applicationUrl"
             target="_blank"
             class="flex-1 px-3 py-2 bg-[#006EC7] text-white text-xs font-medium rounded-lg hover:bg-[#005BA3] transition-colors text-center">
            Oeffnen
          </a>

          <!-- Stop -->
          <button *ngIf="installed.deployStatus === 'RUNNING'"
                  (click)="undeployApp(installed)"
                  [disabled]="undeployingId === installed.id"
                  class="px-3 py-2 bg-white border border-orange-200 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50">
            {{ undeployingId === installed.id ? 'Stoppt...' : 'Stoppen' }}
          </button>

          <!-- Show Log -->
          <button *ngIf="installed.deployLog"
                  (click)="toggleLog(installed.id)"
                  class="px-3 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
            {{ expandedLogId === installed.id ? 'Log ausblenden' : 'Log' }}
          </button>

          <!-- Uninstall -->
          <button *ngIf="authService.darfAppInstallieren()"
                  (click)="uninstall(installed)"
                  [disabled]="uninstallingId === installed.id"
                  class="px-3 py-2 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
            {{ uninstallingId === installed.id ? 'Entfernt...' : 'Deinstallieren' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="apps.length === 0 && !loading" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p class="text-gray-500 text-sm mb-4">Noch keine Apps installiert.</p>
      <a routerLink="/appstore"
         class="inline-flex px-4 py-2 bg-[#006EC7] text-white text-sm font-medium rounded-lg hover:bg-[#005BA3] transition-colors">
        Apps entdecken
      </a>
    </div>
  `,
})
export class InstalledAppsComponent implements OnInit {
  private readonly installedAppService = inject(InstalledAppService);
  private readonly deploymentService = inject(DeploymentService);
  private readonly portalState = inject(PortalStateService);
  readonly authService = inject(AuthService);

  apps: InstalledApp[] = [];
  loading = true;
  uninstallingId: string | null = null;
  deployingId: string | null = null;
  undeployingId: string | null = null;
  expandedLogId: string | null = null;

  ngOnInit(): void {
    this.loadInstalledApps();
  }

  private loadInstalledApps(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.getAll(tenantId).subscribe({
      next: (installed) => {
        this.apps = installed;
        this.loading = false;
      },
      error: () => {
        this.apps = [];
        this.loading = false;
      }
    });
  }

  canDeploy(installed: InstalledApp): boolean {
    return !!(installed.app?.repositoryUrl || installed.app?.manifestImage);
  }

  deployApp(installed: InstalledApp): void {
    this.deployingId = installed.id;
    this.deploymentService.deploy(installed.id).subscribe({
      next: () => {
        // Async deploy started, poll for status
        installed.deployStatus = 'DEPLOYING';
        this.deployingId = null;
        this.pollDeployStatus(installed);
      },
      error: () => {
        this.deployingId = null;
      }
    });
  }

  private pollDeployStatus(installed: InstalledApp): void {
    const interval = setInterval(() => {
      this.deploymentService.getStatus(installed.id).subscribe({
        next: (status) => {
          installed.deployStatus = status.deployStatus;
          installed.deployLog = status.deployLog;
          installed.containerPort = status.containerPort;
          if (status.deployStatus !== 'DEPLOYING') {
            clearInterval(interval);
            // Reload to get updated applicationUrl
            this.loadInstalledApps();
          }
        },
        error: () => clearInterval(interval)
      });
    }, 3000);
  }

  undeployApp(installed: InstalledApp): void {
    this.undeployingId = installed.id;
    this.deploymentService.undeploy(installed.id).subscribe({
      next: (result) => {
        installed.deployStatus = result.deployStatus;
        installed.containerPort = undefined;
        this.undeployingId = null;
      },
      error: () => {
        this.undeployingId = null;
      }
    });
  }

  toggleLog(id: string): void {
    this.expandedLogId = this.expandedLogId === id ? null : id;
  }

  getDeployBadgeClass(installed: InstalledApp): Record<string, boolean> {
    const s = installed.deployStatus;
    return {
      'bg-green-50 text-green-700': s === 'RUNNING',
      'bg-blue-50 text-blue-700': s === 'DEPLOYING',
      'bg-red-50 text-red-700': s === 'FAILED',
      'bg-orange-50 text-orange-700': s === 'STOPPED',
      'bg-gray-100 text-gray-500': !s || s === 'PENDING',
    };
  }

  getDeployLabel(installed: InstalledApp): string {
    switch (installed.deployStatus) {
      case 'RUNNING': return 'Laeuft';
      case 'DEPLOYING': return 'Deploying...';
      case 'FAILED': return 'Fehlgeschlagen';
      case 'STOPPED': return 'Gestoppt';
      default: return installed.status === 'ACTIVE' ? 'Nicht deployed' : installed.status;
    }
  }

  getDeployButtonLabel(installed: InstalledApp): string {
    if (this.deployingId === installed.id) return 'Deploying...';
    switch (installed.deployStatus) {
      case 'RUNNING': return 'Redeploy';
      case 'FAILED': return 'Erneut deployen';
      case 'STOPPED': return 'Starten';
      default: return 'Deployen';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  uninstall(installed: InstalledApp): void {
    if (!installed.app) return;
    // Undeploy first if running
    if (installed.deployStatus === 'RUNNING') {
      this.deploymentService.undeploy(installed.id).subscribe({
        next: () => this.doUninstall(installed),
        error: () => this.doUninstall(installed)
      });
    } else {
      this.doUninstall(installed);
    }
  }

  private doUninstall(installed: InstalledApp): void {
    if (!installed.app) return;
    this.uninstallingId = installed.id;
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.uninstall(tenantId, installed.app.id).subscribe({
      next: () => {
        this.apps = this.apps.filter(a => a.id !== installed.id);
        this.uninstallingId = null;
      },
      error: () => {
        this.uninstallingId = null;
      }
    });
  }
}
