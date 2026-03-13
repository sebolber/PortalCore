import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { PortalStateService } from '../services/portal-state.service';
import { InstalledAppService } from '../services/installed-app.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { CustomMenuService, CustomMenuItem } from '../services/custom-menu.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private readonly portalState = inject(PortalStateService);
  private readonly installedAppService = inject(InstalledAppService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  private readonly customMenuService = inject(CustomMenuService);

  readonly collapsed = this.portalState.sidebarCollapsed;
  readonly mobileSidebarOpen = this.portalState.mobileSidebarOpen;
  readonly isAdmin = computed(() => this.portalState.userRole() === 'admin');
  readonly installedApps = signal<{ id: string; name: string; shortName: string; color: string; route: string }[]>([]);
  readonly customMenuItems = signal<CustomMenuItem[]>([]);
  readonly theme = this.themeService.theme;

  plattformExpanded = false;
  installedAppsExpanded = true;
  customMenuExpanded = true;

  ngOnInit(): void {
    this.loadInstalledApps();
    this.loadCustomMenuItems();

    // Close mobile sidebar on navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.portalState.closeMobileSidebar();
    });
  }

  loadCustomMenuItems(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.customMenuService.getTopLevel(tenantId).subscribe({
      next: (items) => this.customMenuItems.set(items.filter(i => i.visible)),
      error: () => this.customMenuItems.set([]),
    });
  }

  toggleCustomMenu(): void {
    if (this.collapsed()) return;
    this.customMenuExpanded = !this.customMenuExpanded;
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

  closeMobile(): void {
    this.portalState.closeMobileSidebar();
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

  doLogout(): void {
    this.authService.logout();
  }
}
