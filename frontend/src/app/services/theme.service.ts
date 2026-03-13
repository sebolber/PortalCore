import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.service';

export interface PortalTheme {
  id: string;
  tenantId: string | null;
  portalTitle: string;
  portalIconInitials: string;
  portalIconUrl: string | null;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  primaryContrast: string;
  secondaryColor: string;
  secondaryDark: string;
  secondaryLight: string;
  secondaryContrast: string;
  fontFamily: string;
  fontFamilyHeading: string;
  fontColor: string;
  fontColorLight: string;
  lastModified: string | null;
  lastModifiedBy: string | null;
}

const DEFAULT_THEME: PortalTheme = {
  id: 'theme-global',
  tenantId: null,
  portalTitle: 'Health Portal',
  portalIconInitials: 'HP',
  portalIconUrl: null,
  primaryColor: '#006EC7',
  primaryDark: '#004F8F',
  primaryLight: '#EBF3FA',
  primaryContrast: '#FFFFFF',
  secondaryColor: '#461EBE',
  secondaryDark: '#2E1480',
  secondaryLight: '#F0EAFB',
  secondaryContrast: '#FFFFFF',
  fontFamily: 'Fira Sans',
  fontFamilyHeading: 'Fira Sans Condensed',
  fontColor: '#252220',
  fontColorLight: '#887D75',
  lastModified: null,
  lastModifiedBy: null,
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);
  readonly theme = signal<PortalTheme>(DEFAULT_THEME);

  loadTheme(tenantId?: string): void {
    const params: Record<string, string> = {};
    if (tenantId) { params['tenantId'] = tenantId; }
    this.http.get<PortalTheme>(`${API_URL}/theme`, { params }).subscribe({
      next: (t) => {
        this.theme.set(t);
        this.applyTheme(t);
      },
      error: () => {
        this.applyTheme(DEFAULT_THEME);
      }
    });
  }

  saveTheme(theme: PortalTheme, tenantId?: string): void {
    const params: Record<string, string> = {};
    if (tenantId) { params['tenantId'] = tenantId; }
    this.http.put<PortalTheme>(`${API_URL}/theme`, theme, { params }).subscribe({
      next: (t) => {
        this.theme.set(t);
        this.applyTheme(t);
      }
    });
  }

  applyTheme(t: PortalTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--portal-primary', t.primaryColor);
    root.style.setProperty('--portal-primary-dark', t.primaryDark);
    root.style.setProperty('--portal-primary-light', t.primaryLight);
    root.style.setProperty('--portal-primary-contrast', t.primaryContrast);
    root.style.setProperty('--portal-secondary', t.secondaryColor);
    root.style.setProperty('--portal-secondary-dark', t.secondaryDark);
    root.style.setProperty('--portal-secondary-light', t.secondaryLight);
    root.style.setProperty('--portal-secondary-contrast', t.secondaryContrast);
    root.style.setProperty('--portal-font-family', t.fontFamily + ', sans-serif');
    root.style.setProperty('--portal-font-family-heading', t.fontFamilyHeading + ', sans-serif');
    root.style.setProperty('--portal-font-color', t.fontColor);
    root.style.setProperty('--portal-font-color-light', t.fontColorLight);

    // Legacy variables for backward compatibility
    root.style.setProperty('--color-primary', t.primaryColor);
    root.style.setProperty('--color-primary-dark', t.primaryDark);
    root.style.setProperty('--color-primary-light', t.primaryLight);
  }
}
