import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { PortalStateService } from '../services/portal-state.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50" style="font-family: var(--portal-font-family, 'Fira Sans', sans-serif)">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col transition-all duration-300 ml-0 md:ml-[var(--sidebar-width)]"
           [style.--sidebar-width]="portalState.sidebarCollapsed() ? '64px' : '256px'">
        <app-header></app-header>
        <main class="flex-1 overflow-auto p-4 md:p-6 mt-16">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class PortalLayoutComponent implements OnInit {
  readonly portalState = inject(PortalStateService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.loadTheme(this.portalState.currentTenantSnapshot.id);
  }
}
