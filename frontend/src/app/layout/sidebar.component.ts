import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalStateService } from '../services/portal-state.service';
import { InstalledAppService } from '../services/installed-app.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private readonly portalState = inject(PortalStateService);
  private readonly installedAppService = inject(InstalledAppService);

  readonly collapsed = this.portalState.sidebarCollapsed;
  readonly isAdmin = computed(() => this.portalState.userRole() === 'admin');
  readonly installedApps = signal<{ id: string; name: string; shortName: string; color: string; route: string }[]>([]);

  plattformExpanded = false;
  installedAppsExpanded = true;

  ngOnInit(): void {
    this.loadInstalledApps();
  }

  loadInstalledApps(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.installedAppService.getAll(tenantId).subscribe({
      next: (installed) => {
        const apps = installed
          .filter(i => i.app && i.status === 'ACTIVE')
          .map(i => ({
            id: i.app!.id,
            name: i.app!.name,
            shortName: i.app!.iconInitials || i.app!.name.substring(0, 2).toUpperCase(),
            color: i.app!.iconColor || '#006EC7',
            route: i.app!.applicationUrl || i.app!.route || '/appstore/' + i.app!.id,
          }));
        this.installedApps.set(apps);
      },
      error: () => {
        this.installedApps.set([]);
      }
    });
  }

  toggle(): void {
    this.portalState.toggleSidebar();
  }

  togglePlattform(): void {
    if (this.collapsed()) {
      return;
    }
    this.plattformExpanded = !this.plattformExpanded;
  }

  toggleInstalledApps(): void {
    if (this.collapsed()) {
      return;
    }
    this.installedAppsExpanded = !this.installedAppsExpanded;
  }
}
