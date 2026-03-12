import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administration</h1>
        <p class="text-sm text-gray-500 mt-1">Systemverwaltung und Konfiguration</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Mandanten</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Apps</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">14</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Warnungen</p>
              <p class="text-2xl font-bold text-yellow-600 mt-1">2</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- System Status -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">System-Status</h2>
          </div>
          <div class="divide-y divide-gray-100">
            <div *ngFor="let service of services"
                 class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full"
                      [ngClass]="{
                        'bg-green-500': service.status === 'online',
                        'bg-yellow-500': service.status === 'warning',
                        'bg-red-500': service.status === 'offline'
                      }"></span>
                <span class="text-sm text-gray-800">{{ service.name }}</span>
              </div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-700': service.status === 'online',
                      'bg-yellow-100 text-yellow-700': service.status === 'warning',
                      'bg-red-100 text-red-700': service.status === 'offline'
                    }">
                {{ service.status === 'online' ? 'Online' : service.status === 'warning' ? 'Warnung' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Letzte Benutzer -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Letzte Benutzer</h2>
          </div>
          <div class="divide-y divide-gray-100">
            <div *ngFor="let user of recentUsers"
                 class="flex items-center gap-3 px-5 py-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                   [style.background-color]="user.color">
                {{ user.initialen }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-xs text-gray-500">Letzter Login: {{ user.letzterLogin }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Admin-Aktionen -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Admin-Aktionen</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div *ngFor="let action of adminActions"
               class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#006EC7]/30 transition-all duration-200 cursor-pointer group">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                 [ngClass]="action.iconBg">
              <svg class="w-5 h-5" [ngClass]="action.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="action.iconPath"/>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-900 group-hover:text-[#006EC7] transition-colors">{{ action.label }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ action.beschreibung }}</p>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class AdminComponent {
  readonly services = [
    { name: 'Portal API', status: 'online' },
    { name: 'Datenbank (PostgreSQL)', status: 'online' },
    { name: 'Keycloak IAM', status: 'online' },
    { name: 'Redis Cache', status: 'warning' },
    { name: 'E-Mail Service', status: 'online' },
    { name: 'Backup Service', status: 'offline' },
  ];

  readonly recentUsers = [
    { initialen: 'SM', name: 'Sabine Mueller', letzterLogin: 'Heute, 08:32', color: '#006EC7' },
    { initialen: 'TW', name: 'Thomas Wagner', letzterLogin: 'Heute, 07:45', color: '#059669' },
    { initialen: 'JB', name: 'Julia Becker', letzterLogin: 'Gestern, 17:20', color: '#7C3AED' },
    { initialen: 'MS', name: 'Michael Schmidt', letzterLogin: 'Gestern, 14:10', color: '#DC2626' },
  ];

  readonly adminActions = [
    {
      label: 'Benutzer',
      beschreibung: 'Benutzerkonten und Rollen verwalten',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Mandanten',
      beschreibung: 'Mandanten und Organisationen konfigurieren',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Apps',
      beschreibung: 'App-Installationen und Lizenzen verwalten',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    },
    {
      label: 'Sicherheit',
      beschreibung: 'Sicherheitsrichtlinien und Zugriffssteuerung',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    },
    {
      label: 'Audit',
      beschreibung: 'Audit-Protokolle und Aktivitaeten einsehen',
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    },
    {
      label: 'System',
      beschreibung: 'Systemkonfiguration und Wartung',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ];
}
