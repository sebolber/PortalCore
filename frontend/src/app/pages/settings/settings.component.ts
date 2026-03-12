import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-3xl" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p class="text-sm text-gray-500 mt-1">Profil und Anwendungseinstellungen verwalten</p>
      </div>

      <!-- Profil -->
      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Profil</h2>
        </div>
        <div class="p-5 space-y-4">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-14 h-14 rounded-full bg-[#006EC7] flex items-center justify-center text-white text-lg font-bold">
              SM
            </div>
            <div>
              <p class="text-base font-semibold text-gray-900">Sabine Mueller</p>
              <p class="text-sm text-gray-500">Administratorin</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
              <input type="text" [(ngModel)]="profile.name"
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">E-Mail</label>
              <input type="email" [(ngModel)]="profile.email"
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Rolle</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              Administratorin
              <span class="ml-2 px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-full">System</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mandant -->
      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Mandant</h2>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Organisation</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                adesso health GmbH
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Mandanten-ID</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono">
                tenant-001
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Darstellung -->
      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Darstellung</h2>
        </div>
        <div class="p-5">
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Theme</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors"
                   [ngClass]="theme === 'light' ? 'border-[#006EC7] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'">
              <input type="radio" name="theme" value="light" [(ngModel)]="theme"
                     class="w-4 h-4 text-[#006EC7] focus:ring-[#006EC7]"/>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/><path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">Light</span>
              </div>
            </label>
            <label class="flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors"
                   [ngClass]="theme === 'dark' ? 'border-[#006EC7] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'">
              <input type="radio" name="theme" value="dark" [(ngModel)]="theme"
                     class="w-4 h-4 text-[#006EC7] focus:ring-[#006EC7]"/>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">Dark</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Benachrichtigungen -->
      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Benachrichtigungen</h2>
        </div>
        <div class="p-5 space-y-5">
          <!-- E-Mail Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">E-Mail-Benachrichtigungen</p>
              <p class="text-xs text-gray-500 mt-0.5">Benachrichtigungen per E-Mail erhalten</p>
            </div>
            <button (click)="notifications.email = !notifications.email"
                    class="relative w-11 h-6 rounded-full transition-colors duration-200"
                    [ngClass]="notifications.email ? 'bg-[#006EC7]' : 'bg-gray-300'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    [ngClass]="notifications.email ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <!-- Push Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Push-Benachrichtigungen</p>
              <p class="text-xs text-gray-500 mt-0.5">Browser-Push-Nachrichten erhalten</p>
            </div>
            <button (click)="notifications.push = !notifications.push"
                    class="relative w-11 h-6 rounded-full transition-colors duration-200"
                    [ngClass]="notifications.push ? 'bg-[#006EC7]' : 'bg-gray-300'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    [ngClass]="notifications.push ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <!-- Digest Frequency -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">Zusammenfassung</label>
            <p class="text-xs text-gray-500 mb-2">Haeufigkeit der Digest-E-Mails</p>
            <select [(ngModel)]="notifications.digest"
                    class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] w-48">
              <option value="taeglich">Taeglich</option>
              <option value="woechentlich">Woechentlich</option>
              <option value="nie">Nie</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sicherheit -->
      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Sicherheit</h2>
        </div>
        <div class="p-5 space-y-4">
          <p class="text-sm text-gray-600 mb-4">Passwort aendern</p>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Aktuelles Passwort</label>
            <input type="password" [(ngModel)]="password.current" placeholder="Aktuelles Passwort eingeben"
                   class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Neues Passwort</label>
              <input type="password" [(ngModel)]="password.newPw" placeholder="Neues Passwort"
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Passwort bestaetigen</label>
              <input type="password" [(ngModel)]="password.confirm" placeholder="Passwort wiederholen"
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
            </div>
          </div>
          <div class="pt-2">
            <button class="px-4 py-2 text-sm font-medium text-white bg-[#006EC7] hover:bg-[#005ba3] rounded-lg transition-colors">
              Passwort aendern
            </button>
          </div>
        </div>
      </div>

      <!-- Save -->
      <div class="flex justify-end gap-3 pb-6">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Abbrechen
        </button>
        <button class="px-6 py-2 text-sm font-medium text-white bg-[#006EC7] hover:bg-[#005ba3] rounded-lg transition-colors">
          Speichern
        </button>
      </div>

    </div>
  `,
})
export class SettingsComponent {
  profile = {
    name: 'Sabine Mueller',
    email: 'sabine.mueller@adesso-health.de',
  };

  theme = 'light';

  notifications = {
    email: true,
    push: false,
    digest: 'woechentlich',
  };

  password = {
    current: '',
    newPw: '',
    confirm: '',
  };
}
