import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomMenuService, CustomMenuItem } from '../../services/custom-menu.service';

@Component({
  selector: 'app-iframe-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full -m-4 md:-m-6 -mt-0">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="w-8 h-8 border-2 border-gray-300 border-t-[var(--portal-primary,#006EC7)] rounded-full animate-spin"></div>
        </div>
      }
      @if (safeUrl()) {
        <iframe
          [src]="safeUrl()"
          class="w-full border-0"
          style="height: calc(100vh - 5rem)"
          [title]="menuItem()?.label || 'Eingebettete Seite'"
        ></iframe>
      }
      @if (error()) {
        <div class="text-center py-16 text-gray-500">
          <p class="text-lg font-medium">Seite konnte nicht geladen werden</p>
          <p class="text-sm mt-2">{{ error() }}</p>
        </div>
      }
    </div>
  `,
})
export class IframePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly menuService = inject(CustomMenuService);

  readonly loading = signal(true);
  readonly menuItem = signal<CustomMenuItem | null>(null);
  readonly safeUrl = signal<SafeResourceUrl | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const menuItemId = params['menuItemId'];
      if (menuItemId) {
        this.loadMenuItem(menuItemId);
      }
    });
  }

  private loadMenuItem(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    // Fetch the menu item directly via HTTP since service uses list endpoints
    this.menuService['http'].get<CustomMenuItem>(`/api/custom-menu-items/${id}`).subscribe({
      next: (item) => {
        this.menuItem.set(item);
        if (item.url) {
          this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(item.url));
        } else {
          this.error.set('Keine URL konfiguriert');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Menuepunkt nicht gefunden');
        this.loading.set(false);
      }
    });
  }
}
