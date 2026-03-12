import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortalUser } from '../models/user.model';
import { Tenant } from '../models/tenant.model';

export type Theme = 'light' | 'dark';

export interface LegacyInstalledApp {
  id: string;
  name: string;
  shortName: string;
  color: string;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class PortalStateService {

  // --- Default data ---

  private readonly defaultTenant: Tenant = {
    id: 't-aok-nw',
    name: 'AOK Nordwest',
    shortName: 'AOK NW'
  };

  private readonly defaultUser: PortalUser = {
    id: 'u-1',
    vorname: 'Sabine',
    nachname: 'Mueller',
    email: 'sabine.mueller@aok-nw.de',
    iamId: 'iam-sabine-mueller',
    tenant: this.defaultTenant,
    mandant: 'AOK Nordwest',
    mandantId: 't-aok-nw',
    status: 'aktiv',
    rollenIds: ['r-admin'],
    letzterLogin: new Date().toISOString(),
    erstelltAm: '2024-01-15T08:00:00Z',
    iamSync: true,
    initialen: 'SM'
  };

  // --- BehaviorSubject-based state ---

  private currentUser$ = new BehaviorSubject<PortalUser>(this.defaultUser);
  private currentTenantSubject$ = new BehaviorSubject<Tenant>(this.defaultTenant);
  private theme$ = new BehaviorSubject<Theme>('light');
  private sidebarCollapsed$ = new BehaviorSubject<boolean>(false);

  // Observable streams
  get user$(): Observable<PortalUser> {
    return this.currentUser$.asObservable();
  }

  get tenant$(): Observable<Tenant> {
    return this.currentTenantSubject$.asObservable();
  }

  get themeChanges$(): Observable<Theme> {
    return this.theme$.asObservable();
  }

  get sidebarCollapsedChanges$(): Observable<boolean> {
    return this.sidebarCollapsed$.asObservable();
  }

  // Snapshot getters
  get currentUserSnapshot(): PortalUser {
    return this.currentUser$.getValue();
  }

  get currentTenantSnapshot(): Tenant {
    return this.currentTenantSubject$.getValue();
  }

  get currentTheme(): Theme {
    return this.theme$.getValue();
  }

  get isSidebarCollapsed(): boolean {
    return this.sidebarCollapsed$.getValue();
  }

  // Mutators (BehaviorSubject)
  setUser(user: PortalUser): void {
    this.currentUser$.next(user);
  }

  setTenant(tenant: Tenant): void {
    this.currentTenantSubject$.next(tenant);
    this.currentTenant.set(tenant);
  }

  setTheme(newTheme: Theme): void {
    this.theme$.next(newTheme);
    this.theme.set(newTheme);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed$.next(collapsed);
    this.sidebarCollapsed.set(collapsed);
  }

  // --- Signal-based state (backward compatible with existing layout components) ---

  readonly sidebarCollapsed = signal(false);
  readonly theme = signal<Theme>('light');
  readonly userRole = signal<'admin' | 'user'>('admin');

  readonly currentTenant = signal<Tenant>(this.defaultTenant);

  readonly installedApps = signal<LegacyInstalledApp[]>([
    { id: 'dmp', name: 'DMP Manager', shortName: 'DM', color: '#006EC7', route: '/apps/dmp' },
    { id: 'hzv', name: 'HZV Portal', shortName: 'HZ', color: '#E5580C', route: '/apps/hzv' },
    { id: 'pzm', name: 'PZM Cockpit', shortName: 'PZ', color: '#16A34A', route: '/apps/pzm' },
  ]);

  readonly isDarkTheme = computed(() => this.theme() === 'dark');

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
    this.sidebarCollapsed$.next(this.sidebarCollapsed());
  }

  toggleTheme(): void {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
    this.theme$.next(this.theme());
  }
}
