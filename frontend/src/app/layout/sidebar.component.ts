import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalStateService } from '../services/portal-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly portalState = inject(PortalStateService);

  readonly collapsed = this.portalState.sidebarCollapsed;
  readonly installedApps = this.portalState.installedApps;
  readonly isAdmin = computed(() => this.portalState.userRole() === 'admin');

  plattformExpanded = false;

  toggle(): void {
    this.portalState.toggleSidebar();
  }

  togglePlattform(): void {
    if (this.collapsed()) {
      return;
    }
    this.plattformExpanded = !this.plattformExpanded;
  }
}
