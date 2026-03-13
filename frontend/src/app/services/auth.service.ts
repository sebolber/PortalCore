import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from './api.service';
import { UseCaseBerechtigung } from '../models/user.model';

export interface AuthUser {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  initialen: string;
  superAdmin?: boolean;
}

export interface AuthTenant {
  id: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  tenantId: string;
  tenants: AuthTenant[];
  berechtigungen: UseCaseBerechtigung[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'portal_token';
  private readonly USER_KEY = 'portal_user';
  private readonly TENANT_KEY = 'portal_tenant';
  private readonly TENANTS_KEY = 'portal_tenants';
  private readonly PERMS_KEY = 'portal_perms';

  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly currentTenantId = signal<string>('');
  readonly availableTenants = signal<AuthTenant[]>([]);
  readonly berechtigungen = signal<UseCaseBerechtigung[]>([]);

  readonly userName = computed(() => {
    const u = this.currentUser();
    return u ? `${u.vorname} ${u.nachname}` : '';
  });

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const user = JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');
      const tenantId = localStorage.getItem(this.TENANT_KEY) || '';
      const tenants = JSON.parse(localStorage.getItem(this.TENANTS_KEY) || '[]');
      const perms = JSON.parse(localStorage.getItem(this.PERMS_KEY) || '[]');
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      this.currentTenantId.set(tenantId);
      this.availableTenants.set(tenants);
      this.berechtigungen.set(perms);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  requestOtp(email: string) {
    return this.http.post<{ message: string }>(`${API_URL}/auth/login`, { email });
  }

  verifyOtp(email: string, code: string, tenantId?: string) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/verify`, { email, code, tenantId });
  }

  handleLoginSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(this.TENANT_KEY, response.tenantId);
    localStorage.setItem(this.TENANTS_KEY, JSON.stringify(response.tenants));
    localStorage.setItem(this.PERMS_KEY, JSON.stringify(response.berechtigungen));

    this.isAuthenticated.set(true);
    this.currentUser.set(response.user);
    this.currentTenantId.set(response.tenantId);
    this.availableTenants.set(response.tenants);
    this.berechtigungen.set(response.berechtigungen);
  }

  logout(): void {
    this.http.post(`${API_URL}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TENANT_KEY);
    localStorage.removeItem(this.TENANTS_KEY);
    localStorage.removeItem(this.PERMS_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentTenantId.set('');
    this.availableTenants.set([]);
    this.berechtigungen.set([]);
    this.router.navigate(['/login']);
  }

  switchTenant(tenantId: string) {
    return this.http.post<{ token: string; tenantId: string }>(
      `${API_URL}/auth/switch-tenant`, { tenantId }
    );
  }

  handleTenantSwitch(result: { token: string; tenantId: string }): void {
    localStorage.setItem(this.TOKEN_KEY, result.token);
    localStorage.setItem(this.TENANT_KEY, result.tenantId);
    this.currentTenantId.set(result.tenantId);
  }

  refreshUserData() {
    return this.http.get<any>(`${API_URL}/auth/me`);
  }

  // Berechtigungspruefung
  hatBerechtigung(useCase: string, typ: 'anzeigen' | 'lesen' | 'schreiben' | 'loeschen'): boolean {
    const perm = this.berechtigungen().find(b => b.useCase === useCase);
    if (!perm) return false;
    return perm[typ];
  }

  darfAnzeigen(useCase: string): boolean {
    return this.hatBerechtigung(useCase, 'anzeigen');
  }

  darfLesen(useCase: string): boolean {
    return this.hatBerechtigung(useCase, 'lesen');
  }

  darfSchreiben(useCase: string): boolean {
    return this.hatBerechtigung(useCase, 'schreiben');
  }

  darfAppInstallieren(): boolean {
    return this.hatBerechtigung('appstore-admin', 'schreiben');
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.superAdmin === true;
  }
}
