import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalUser, PortalRolle, Berechtigung } from '../../models/user.model';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'erstellt' | 'geaendert' | 'geloescht' | 'login' | 'gesperrt' | 'entsperrt';
  beschreibung: string;
  benutzer: string;
  ausgefuehrtVon: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-condensed font-semibold text-gray-900">Benutzerverwaltung</h1>
        <p class="text-sm text-gray-500 mt-1">Benutzer, Rollen und Berechtigungen verwalten</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="activeTab.set(tab.key)"
            class="px-4 py-2.5 text-sm font-medium transition-colors relative"
            [class]="activeTab() === tab.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
            <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
              [class]="activeTab() === tab.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'">
              {{ tab.count }}
            </span>
          </button>
        }
      </div>

      <!-- Tab 1: Benutzer -->
      @if (activeTab() === 'benutzer') {
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          @for (stat of userStats; track stat.label) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
              <div class="text-2xl font-semibold" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Benutzer suchen..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
          />
          <select
            [ngModel]="statusFilter()"
            (ngModelChange)="statusFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Status</option>
            <option value="aktiv">Aktiv</option>
            <option value="inaktiv">Inaktiv</option>
            <option value="gesperrt">Gesperrt</option>
          </select>
          <select
            [ngModel]="tenantFilter()"
            (ngModelChange)="tenantFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Mandanten</option>
            @for (t of tenants; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden overflow-x-auto">
          <table class="w-full text-sm min-w-[800px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Mandant</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Rollen</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Letzter Login</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">IAM</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.id) {
                <tr
                  class="border-b border-gray-100 hover:bg-primary-light/30 cursor-pointer transition-colors"
                  (click)="selectUser(user)"
                  [class.bg-primary-light]="selectedUser()?.id === user.id"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {{ user.initialen }}
                      </div>
                      <span class="font-medium text-gray-900">{{ user.vorname }} {{ user.nachname }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                      [class]="statusClass(user.status)">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ user.mandant }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      @for (rolleId of user.rollenIds; track rolleId) {
                        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          [style.border-left]="'3px solid ' + getRolleColor(rolleId)">
                          {{ getRolleName(rolleId) }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ user.letzterLogin }}</td>
                  <td class="px-4 py-3">
                    <span class="w-2.5 h-2.5 rounded-full inline-block"
                      [class]="user.iamSync ? 'bg-success' : 'bg-gray-300'"
                      [title]="user.iamSync ? 'Synchronisiert' : 'Nicht synchronisiert'">
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Detail Panel -->
        @if (selectedUser(); as user) {
          <div class="mt-4 bg-white rounded-lg border border-gray-200 shadow-card p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                  {{ user.initialen }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ user.vorname }} {{ user.nachname }}</h3>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <button (click)="selectedUser.set(null)" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div class="text-gray-500 text-xs mb-1">Status</div>
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" [class]="statusClass(user.status)">{{ user.status }}</span>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Mandant</div>
                <div class="text-gray-900">{{ user.mandant }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">IAM ID</div>
                <div class="text-gray-900 font-mono text-xs">{{ user.iamId }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Erstellt am</div>
                <div class="text-gray-900">{{ user.erstelltAm }}</div>
              </div>
            </div>
          </div>
        }
      }

      <!-- Tab 2: Rollen -->
      @if (activeTab() === 'rollen') {
        <div class="space-y-3">
          @for (rolle of rollen; track rolle.id) {
            <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
              <div
                class="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                (click)="toggleRolle(rolle.id)"
              >
                <div class="w-1.5 h-10 rounded-full shrink-0" [style.background-color]="rolle.farbe"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ rolle.name }}</span>
                    @if (rolle.systemRolle) {
                      <span class="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">System</span>
                    }
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">{{ rolle.beschreibung }}</p>
                </div>
                <div class="flex items-center gap-6 text-sm text-gray-500 shrink-0">
                  <div class="text-center">
                    <div class="font-semibold text-gray-900">{{ rolle.hierarchie }}</div>
                    <div class="text-xs">Hierarchie</div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900">{{ rolle.benutzerAnzahl }}</div>
                    <div class="text-xs">Benutzer</div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900">{{ rolle.berechtigungIds.length }}</div>
                    <div class="text-xs">Berechtigungen</div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="expandedRollen().has(rolle.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              @if (expandedRollen().has(rolle.id)) {
                <div class="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Berechtigungen</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                    @for (permId of rolle.berechtigungIds; track permId) {
                      @if (getBerechtigungById(permId); as perm) {
                        <div class="text-xs px-2.5 py-1.5 bg-white rounded border border-gray-200 flex items-center justify-between">
                          <span class="text-gray-700">{{ perm.label }}</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            [class]="typClass(perm.typ)">{{ perm.typ }}</span>
                        </div>
                      }
                    }
                  </div>
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Zugewiesene Benutzer</h4>
                  <div class="flex flex-wrap gap-2">
                    @for (user of getUsersByRolle(rolle.id); track user.id) {
                      <div class="flex items-center gap-2 text-xs bg-white rounded-full border border-gray-200 pl-1 pr-3 py-1">
                        <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                          {{ user.initialen }}
                        </div>
                        {{ user.vorname }} {{ user.nachname }}
                      </div>
                    }
                    @if (getUsersByRolle(rolle.id).length === 0) {
                      <span class="text-xs text-gray-400 italic">Keine Benutzer zugewiesen</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Tab 3: Berechtigungen -->
      @if (activeTab() === 'berechtigungen') {
        <!-- Filter -->
        <div class="mb-4">
          <select
            [ngModel]="permAppFilter()"
            (ngModelChange)="permAppFilter.set($event)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Alle Apps</option>
            @for (app of permAppNames(); track app) {
              <option [value]="app">{{ app }}</option>
            }
          </select>
        </div>

        <!-- Grouped Permissions -->
        @for (group of groupedPermissions(); track group.appName) {
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              {{ group.appName }}
            </h3>
            @for (subGroup of group.groups; track subGroup.gruppe) {
              <div class="ml-4 mb-3">
                <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ subGroup.gruppe }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  @for (perm of subGroup.permissions; track perm.id) {
                    <div class="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                      <div class="flex items-center justify-between mb-1">
                        <code class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ perm.key }}</code>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" [class]="typClass(perm.typ)">{{ perm.typ }}</span>
                      </div>
                      <div class="text-gray-900 font-medium">{{ perm.label }}</div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Tab 4: Audit-Trail -->
      @if (activeTab() === 'audit') {
        <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden overflow-x-auto">
          <table class="w-full text-sm min-w-[700px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-medium text-gray-600">Zeitpunkt</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Aktion</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Beschreibung</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Benutzer</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Ausgefuehrt von</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of auditTrail; track entry.id) {
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500 text-xs font-mono">{{ entry.timestamp }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" [class]="auditActionClass(entry.action)">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ entry.beschreibung }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ entry.benutzer }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ entry.ausgefuehrtVon }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class UsersComponent {
  readonly activeTab = signal<'benutzer' | 'rollen' | 'berechtigungen' | 'audit'>('benutzer');
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly tenantFilter = signal('');
  readonly selectedUser = signal<PortalUser | null>(null);
  readonly expandedRollen = signal<Set<string>>(new Set());
  readonly permAppFilter = signal('');

  readonly tabs = [
    { key: 'benutzer' as const, label: 'Benutzer', count: 12 },
    { key: 'rollen' as const, label: 'Rollen', count: 7 },
    { key: 'berechtigungen' as const, label: 'Berechtigungen', count: 31 },
    { key: 'audit' as const, label: 'Audit-Trail', count: 15 },
  ];

  readonly tenants = ['AOK Bayern', 'TK Hamburg', 'Barmer Berlin'];

  readonly userStats = [
    { label: 'Gesamt', value: 12, color: '#006EC7' },
    { label: 'Aktiv', value: 9, color: '#28A745' },
    { label: 'Inaktiv', value: 1, color: '#887D75' },
    { label: 'Gesperrt', value: 1, color: '#CC3333' },
    { label: 'Mandanten', value: 3, color: '#461EBE' },
    { label: 'Rollen', value: 7, color: '#28DCAA' },
  ];

  readonly users: PortalUser[] = [
    { id: 'u1', vorname: 'Anna', nachname: 'Schneider', email: 'anna.schneider@aok.de', iamId: 'iam-001', tenant: { id: 't1', name: 'AOK Bayern', shortName: 'AOK' }, mandant: 'AOK Bayern', mandantId: 't1', status: 'aktiv', rollenIds: ['r1', 'r2'], letzterLogin: '2026-03-12 09:15', erstelltAm: '2025-01-10', iamSync: true, initialen: 'AS' },
    { id: 'u2', vorname: 'Markus', nachname: 'Weber', email: 'markus.weber@aok.de', iamId: 'iam-002', tenant: { id: 't1', name: 'AOK Bayern', shortName: 'AOK' }, mandant: 'AOK Bayern', mandantId: 't1', status: 'aktiv', rollenIds: ['r2'], letzterLogin: '2026-03-12 08:42', erstelltAm: '2025-02-15', iamSync: true, initialen: 'MW' },
    { id: 'u3', vorname: 'Laura', nachname: 'Mueller', email: 'laura.mueller@tk.de', iamId: 'iam-003', tenant: { id: 't2', name: 'TK Hamburg', shortName: 'TK' }, mandant: 'TK Hamburg', mandantId: 't2', status: 'aktiv', rollenIds: ['r1', 'r3'], letzterLogin: '2026-03-11 17:30', erstelltAm: '2025-03-01', iamSync: true, initialen: 'LM' },
    { id: 'u4', vorname: 'Thomas', nachname: 'Fischer', email: 'thomas.fischer@tk.de', iamId: 'iam-004', tenant: { id: 't2', name: 'TK Hamburg', shortName: 'TK' }, mandant: 'TK Hamburg', mandantId: 't2', status: 'aktiv', rollenIds: ['r3', 'r4'], letzterLogin: '2026-03-12 10:05', erstelltAm: '2025-03-20', iamSync: true, initialen: 'TF' },
    { id: 'u5', vorname: 'Sandra', nachname: 'Becker', email: 'sandra.becker@barmer.de', iamId: 'iam-005', tenant: { id: 't3', name: 'Barmer Berlin', shortName: 'BAR' }, mandant: 'Barmer Berlin', mandantId: 't3', status: 'aktiv', rollenIds: ['r2', 'r5'], letzterLogin: '2026-03-10 14:22', erstelltAm: '2025-04-05', iamSync: true, initialen: 'SB' },
    { id: 'u6', vorname: 'Jan', nachname: 'Hoffmann', email: 'jan.hoffmann@aok.de', iamId: 'iam-006', tenant: { id: 't1', name: 'AOK Bayern', shortName: 'AOK' }, mandant: 'AOK Bayern', mandantId: 't1', status: 'aktiv', rollenIds: ['r4'], letzterLogin: '2026-03-12 07:55', erstelltAm: '2025-05-12', iamSync: true, initialen: 'JH' },
    { id: 'u7', vorname: 'Petra', nachname: 'Klein', email: 'petra.klein@barmer.de', iamId: 'iam-007', tenant: { id: 't3', name: 'Barmer Berlin', shortName: 'BAR' }, mandant: 'Barmer Berlin', mandantId: 't3', status: 'aktiv', rollenIds: ['r5', 'r6'], letzterLogin: '2026-03-11 16:10', erstelltAm: '2025-06-01', iamSync: false, initialen: 'PK' },
    { id: 'u8', vorname: 'Michael', nachname: 'Braun', email: 'michael.braun@aok.de', iamId: 'iam-008', tenant: { id: 't1', name: 'AOK Bayern', shortName: 'AOK' }, mandant: 'AOK Bayern', mandantId: 't1', status: 'aktiv', rollenIds: ['r2', 'r7'], letzterLogin: '2026-03-12 11:30', erstelltAm: '2025-06-15', iamSync: true, initialen: 'MB' },
    { id: 'u9', vorname: 'Claudia', nachname: 'Wolf', email: 'claudia.wolf@tk.de', iamId: 'iam-009', tenant: { id: 't2', name: 'TK Hamburg', shortName: 'TK' }, mandant: 'TK Hamburg', mandantId: 't2', status: 'aktiv', rollenIds: ['r3'], letzterLogin: '2026-03-09 09:45', erstelltAm: '2025-07-20', iamSync: true, initialen: 'CW' },
    { id: 'u10', vorname: 'Stefan', nachname: 'Schulz', email: 'stefan.schulz@aok.de', iamId: 'iam-010', tenant: { id: 't1', name: 'AOK Bayern', shortName: 'AOK' }, mandant: 'AOK Bayern', mandantId: 't1', status: 'inaktiv', rollenIds: ['r4'], letzterLogin: '2026-01-15 13:00', erstelltAm: '2025-08-01', iamSync: false, initialen: 'SS' },
    { id: 'u11', vorname: 'Nicole', nachname: 'Richter', email: 'nicole.richter@barmer.de', iamId: 'iam-011', tenant: { id: 't3', name: 'Barmer Berlin', shortName: 'BAR' }, mandant: 'Barmer Berlin', mandantId: 't3', status: 'gesperrt', rollenIds: ['r6'], letzterLogin: '2026-02-20 10:15', erstelltAm: '2025-09-10', iamSync: false, initialen: 'NR' },
    { id: 'u12', vorname: 'Daniel', nachname: 'Hartmann', email: 'daniel.hartmann@tk.de', iamId: 'iam-012', tenant: { id: 't2', name: 'TK Hamburg', shortName: 'TK' }, mandant: 'TK Hamburg', mandantId: 't2', status: 'aktiv', rollenIds: ['r1', 'r7'], letzterLogin: '2026-03-12 08:00', erstelltAm: '2025-10-01', iamSync: true, initialen: 'DH' },
  ];

  readonly rollen: PortalRolle[] = [
    { id: 'r1', name: 'Administrator', beschreibung: 'Vollzugriff auf alle Systembereiche und Konfigurationen', hierarchie: 1, berechtigungIds: ['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10'], scope: 'global', benutzerAnzahl: 3, systemRolle: true, farbe: '#CC3333' },
    { id: 'r2', name: 'Sachbearbeiter', beschreibung: 'Fallbearbeitung und Standardvorgaenge', hierarchie: 3, berechtigungIds: ['p1','p5','p11','p12','p13'], scope: 'mandant', benutzerAnzahl: 4, systemRolle: false, farbe: '#006EC7' },
    { id: 'r3', name: 'Teamleiter', beschreibung: 'Teamverwaltung und erweiterte Bearbeitungsrechte', hierarchie: 2, berechtigungIds: ['p1','p2','p5','p6','p11','p12','p14','p15'], scope: 'mandant', benutzerAnzahl: 3, systemRolle: false, farbe: '#28DCAA' },
    { id: 'r4', name: 'Pruefer', beschreibung: 'Pruefung und Freigabe von Vorgaengen', hierarchie: 4, berechtigungIds: ['p1','p5','p16','p17','p18'], scope: 'mandant', benutzerAnzahl: 3, systemRolle: false, farbe: '#FF9868' },
    { id: 'r5', name: 'Abrechnungsexperte', beschreibung: 'Abrechnungsprozesse und Finanzauswertungen', hierarchie: 3, berechtigungIds: ['p1','p19','p20','p21','p22'], scope: 'mandant', benutzerAnzahl: 2, systemRolle: false, farbe: '#F566BA' },
    { id: 'r6', name: 'Lesebenutzer', beschreibung: 'Nur lesender Zugriff auf freigegebene Bereiche', hierarchie: 5, berechtigungIds: ['p1','p5','p11'], scope: 'eingeschraenkt', benutzerAnzahl: 2, systemRolle: true, farbe: '#887D75' },
    { id: 'r7', name: 'API-Integration', beschreibung: 'Technischer Zugang fuer Schnittstellenanbindung', hierarchie: 6, berechtigungIds: ['p23','p24','p25','p26'], scope: 'technisch', benutzerAnzahl: 2, systemRolle: true, farbe: '#461EBE' },
  ];

  readonly berechtigungen: Berechtigung[] = [
    { id: 'p1', key: 'portal.dashboard.lesen', label: 'Dashboard anzeigen', beschreibung: '', typ: 'lesen', appId: 'portal', appName: 'Portal', gruppe: 'Dashboard' },
    { id: 'p2', key: 'portal.dashboard.schreiben', label: 'Dashboard konfigurieren', beschreibung: '', typ: 'schreiben', appId: 'portal', appName: 'Portal', gruppe: 'Dashboard' },
    { id: 'p3', key: 'portal.benutzer.schreiben', label: 'Benutzer verwalten', beschreibung: '', typ: 'schreiben', appId: 'portal', appName: 'Portal', gruppe: 'Benutzerverwaltung' },
    { id: 'p4', key: 'portal.benutzer.loeschen', label: 'Benutzer loeschen', beschreibung: '', typ: 'loeschen', appId: 'portal', appName: 'Portal', gruppe: 'Benutzerverwaltung' },
    { id: 'p5', key: 'portal.nachrichten.lesen', label: 'Nachrichten lesen', beschreibung: '', typ: 'lesen', appId: 'portal', appName: 'Portal', gruppe: 'Nachrichten' },
    { id: 'p6', key: 'portal.nachrichten.schreiben', label: 'Nachrichten senden', beschreibung: '', typ: 'schreiben', appId: 'portal', appName: 'Portal', gruppe: 'Nachrichten' },
    { id: 'p7', key: 'portal.parameter.schreiben', label: 'Parameter aendern', beschreibung: '', typ: 'schreiben', appId: 'portal', appName: 'Portal', gruppe: 'Parameter' },
    { id: 'p8', key: 'portal.parameter.admin', label: 'Parameter administrieren', beschreibung: '', typ: 'admin', appId: 'portal', appName: 'Portal', gruppe: 'Parameter' },
    { id: 'p9', key: 'portal.rollen.admin', label: 'Rollen verwalten', beschreibung: '', typ: 'admin', appId: 'portal', appName: 'Portal', gruppe: 'Rollen' },
    { id: 'p10', key: 'portal.audit.lesen', label: 'Audit-Trail einsehen', beschreibung: '', typ: 'lesen', appId: 'portal', appName: 'Portal', gruppe: 'Audit' },
    { id: 'p11', key: 'smile.faelle.lesen', label: 'Faelle anzeigen', beschreibung: '', typ: 'lesen', appId: 'smile', appName: 'SMILE KH', gruppe: 'Fallmanagement' },
    { id: 'p12', key: 'smile.faelle.schreiben', label: 'Faelle bearbeiten', beschreibung: '', typ: 'schreiben', appId: 'smile', appName: 'SMILE KH', gruppe: 'Fallmanagement' },
    { id: 'p13', key: 'smile.faelle.loeschen', label: 'Faelle loeschen', beschreibung: '', typ: 'loeschen', appId: 'smile', appName: 'SMILE KH', gruppe: 'Fallmanagement' },
    { id: 'p14', key: 'smile.team.lesen', label: 'Team anzeigen', beschreibung: '', typ: 'lesen', appId: 'smile', appName: 'SMILE KH', gruppe: 'Teamverwaltung' },
    { id: 'p15', key: 'smile.team.schreiben', label: 'Team verwalten', beschreibung: '', typ: 'schreiben', appId: 'smile', appName: 'SMILE KH', gruppe: 'Teamverwaltung' },
    { id: 'p16', key: 'smile.pruefung.lesen', label: 'Pruefungen anzeigen', beschreibung: '', typ: 'lesen', appId: 'smile', appName: 'SMILE KH', gruppe: 'Pruefung' },
    { id: 'p17', key: 'smile.pruefung.schreiben', label: 'Pruefungen durchfuehren', beschreibung: '', typ: 'schreiben', appId: 'smile', appName: 'SMILE KH', gruppe: 'Pruefung' },
    { id: 'p18', key: 'smile.pruefung.freigabe', label: 'Pruefungen freigeben', beschreibung: '', typ: 'admin', appId: 'smile', appName: 'SMILE KH', gruppe: 'Pruefung' },
    { id: 'p19', key: 'abrechnung.rechnungen.lesen', label: 'Rechnungen anzeigen', beschreibung: '', typ: 'lesen', appId: 'abrechnung', appName: 'Abrechnung', gruppe: 'Rechnungen' },
    { id: 'p20', key: 'abrechnung.rechnungen.schreiben', label: 'Rechnungen erstellen', beschreibung: '', typ: 'schreiben', appId: 'abrechnung', appName: 'Abrechnung', gruppe: 'Rechnungen' },
    { id: 'p21', key: 'abrechnung.auswertung.lesen', label: 'Auswertungen anzeigen', beschreibung: '', typ: 'lesen', appId: 'abrechnung', appName: 'Abrechnung', gruppe: 'Auswertung' },
    { id: 'p22', key: 'abrechnung.auswertung.export', label: 'Auswertungen exportieren', beschreibung: '', typ: 'schreiben', appId: 'abrechnung', appName: 'Abrechnung', gruppe: 'Auswertung' },
    { id: 'p23', key: 'api.rest.lesen', label: 'REST API lesen', beschreibung: '', typ: 'lesen', appId: 'api', appName: 'API Gateway', gruppe: 'REST' },
    { id: 'p24', key: 'api.rest.schreiben', label: 'REST API schreiben', beschreibung: '', typ: 'schreiben', appId: 'api', appName: 'API Gateway', gruppe: 'REST' },
    { id: 'p25', key: 'api.webhook.lesen', label: 'Webhooks anzeigen', beschreibung: '', typ: 'lesen', appId: 'api', appName: 'API Gateway', gruppe: 'Webhooks' },
    { id: 'p26', key: 'api.webhook.schreiben', label: 'Webhooks verwalten', beschreibung: '', typ: 'schreiben', appId: 'api', appName: 'API Gateway', gruppe: 'Webhooks' },
    { id: 'p27', key: 'wb.antraege.lesen', label: 'Antraege anzeigen', beschreibung: '', typ: 'lesen', appId: 'wb', appName: 'WB-Foerderung', gruppe: 'Antraege' },
    { id: 'p28', key: 'wb.antraege.schreiben', label: 'Antraege bearbeiten', beschreibung: '', typ: 'schreiben', appId: 'wb', appName: 'WB-Foerderung', gruppe: 'Antraege' },
    { id: 'p29', key: 'wb.foerderung.lesen', label: 'Foerderungen anzeigen', beschreibung: '', typ: 'lesen', appId: 'wb', appName: 'WB-Foerderung', gruppe: 'Foerderung' },
    { id: 'p30', key: 'wb.foerderung.admin', label: 'Foerderungen verwalten', beschreibung: '', typ: 'admin', appId: 'wb', appName: 'WB-Foerderung', gruppe: 'Foerderung' },
    { id: 'p31', key: 'arzt.register.lesen', label: 'Arztregister einsehen', beschreibung: '', typ: 'lesen', appId: 'arzt', appName: 'Arztregister', gruppe: 'Register' },
  ];

  readonly auditTrail: AuditEntry[] = [
    { id: 'a1', timestamp: '2026-03-12 11:30:00', action: 'login', beschreibung: 'Erfolgreicher Login', benutzer: 'Michael Braun', ausgefuehrtVon: 'Michael Braun' },
    { id: 'a2', timestamp: '2026-03-12 10:05:00', action: 'login', beschreibung: 'Erfolgreicher Login', benutzer: 'Thomas Fischer', ausgefuehrtVon: 'Thomas Fischer' },
    { id: 'a3', timestamp: '2026-03-12 09:15:00', action: 'geaendert', beschreibung: 'Rolle Sachbearbeiter zugewiesen', benutzer: 'Anna Schneider', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a4', timestamp: '2026-03-11 17:30:00', action: 'login', beschreibung: 'Erfolgreicher Login', benutzer: 'Laura Mueller', ausgefuehrtVon: 'Laura Mueller' },
    { id: 'a5', timestamp: '2026-03-11 16:10:00', action: 'geaendert', beschreibung: 'E-Mail-Adresse aktualisiert', benutzer: 'Petra Klein', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a6', timestamp: '2026-03-10 14:22:00', action: 'erstellt', beschreibung: 'Benutzer angelegt', benutzer: 'Sandra Becker', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a7', timestamp: '2026-03-09 09:45:00', action: 'login', beschreibung: 'Erfolgreicher Login', benutzer: 'Claudia Wolf', ausgefuehrtVon: 'Claudia Wolf' },
    { id: 'a8', timestamp: '2026-03-08 11:00:00', action: 'gesperrt', beschreibung: 'Benutzer gesperrt wegen Verdacht', benutzer: 'Nicole Richter', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a9', timestamp: '2026-03-07 15:30:00', action: 'geaendert', beschreibung: 'Passwort zurueckgesetzt', benutzer: 'Stefan Schulz', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a10', timestamp: '2026-03-06 09:00:00', action: 'erstellt', beschreibung: 'Rolle API-Integration erstellt', benutzer: '-', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a11', timestamp: '2026-03-05 13:15:00', action: 'geaendert', beschreibung: 'Mandant geaendert', benutzer: 'Jan Hoffmann', ausgefuehrtVon: 'Laura Mueller' },
    { id: 'a12', timestamp: '2026-03-04 10:45:00', action: 'geloescht', beschreibung: 'Testbenutzer entfernt', benutzer: 'Test User', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a13', timestamp: '2026-03-03 16:00:00', action: 'entsperrt', beschreibung: 'Benutzer entsperrt', benutzer: 'Markus Weber', ausgefuehrtVon: 'Laura Mueller' },
    { id: 'a14', timestamp: '2026-03-02 08:30:00', action: 'erstellt', beschreibung: 'Berechtigung wb.foerderung.admin hinzugefuegt', benutzer: '-', ausgefuehrtVon: 'Anna Schneider' },
    { id: 'a15', timestamp: '2026-03-01 14:00:00', action: 'geaendert', beschreibung: 'Status auf inaktiv gesetzt', benutzer: 'Stefan Schulz', ausgefuehrtVon: 'Anna Schneider' },
  ];

  readonly filteredUsers = computed(() => {
    let result = this.users;
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(u =>
        `${u.vorname} ${u.nachname}`.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    const status = this.statusFilter();
    if (status) {
      result = result.filter(u => u.status === status);
    }
    const tenant = this.tenantFilter();
    if (tenant) {
      result = result.filter(u => u.mandant === tenant);
    }
    return result;
  });

  readonly permAppNames = computed(() => {
    const names = new Set(this.berechtigungen.map(b => b.appName));
    return Array.from(names);
  });

  readonly groupedPermissions = computed(() => {
    let perms = this.berechtigungen;
    const appFilter = this.permAppFilter();
    if (appFilter) {
      perms = perms.filter(p => p.appName === appFilter);
    }
    const byApp = new Map<string, Map<string, Berechtigung[]>>();
    for (const p of perms) {
      if (!byApp.has(p.appName)) byApp.set(p.appName, new Map());
      const appMap = byApp.get(p.appName)!;
      if (!appMap.has(p.gruppe)) appMap.set(p.gruppe, []);
      appMap.get(p.gruppe)!.push(p);
    }
    return Array.from(byApp.entries()).map(([appName, groups]) => ({
      appName,
      groups: Array.from(groups.entries()).map(([gruppe, permissions]) => ({ gruppe, permissions })),
    }));
  });

  selectUser(user: PortalUser): void {
    this.selectedUser.set(this.selectedUser()?.id === user.id ? null : user);
  }

  toggleRolle(id: string): void {
    const current = new Set(this.expandedRollen());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.expandedRollen.set(current);
  }

  getRolleName(id: string): string {
    return this.rollen.find(r => r.id === id)?.name ?? id;
  }

  getRolleColor(id: string): string {
    return this.rollen.find(r => r.id === id)?.farbe ?? '#887D75';
  }

  getBerechtigungById(id: string): Berechtigung | undefined {
    return this.berechtigungen.find(b => b.id === id);
  }

  getUsersByRolle(rolleId: string): PortalUser[] {
    return this.users.filter(u => u.rollenIds.includes(rolleId));
  }

  statusClass(status: string): string {
    switch (status) {
      case 'aktiv': return 'bg-success/10 text-success';
      case 'inaktiv': return 'bg-gray-100 text-gray-500';
      case 'gesperrt': return 'bg-error/10 text-error';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  typClass(typ: string): string {
    switch (typ) {
      case 'lesen': return 'bg-primary/10 text-primary';
      case 'schreiben': return 'bg-success/10 text-success';
      case 'loeschen': return 'bg-error/10 text-error';
      case 'admin': return 'bg-warning/10 text-warning';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  auditActionClass(action: string): string {
    switch (action) {
      case 'erstellt': return 'bg-success/10 text-success';
      case 'geaendert': return 'bg-primary/10 text-primary';
      case 'geloescht': return 'bg-error/10 text-error';
      case 'login': return 'bg-info/10 text-info';
      case 'gesperrt': return 'bg-error/10 text-error';
      case 'entsperrt': return 'bg-success/10 text-success';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
}
