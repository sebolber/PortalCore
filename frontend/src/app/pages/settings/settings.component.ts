import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, PortalTheme } from '../../services/theme.service';
import { CustomMenuService, CustomMenuItem, MenuOrderConfig } from '../../services/custom-menu.service';
import { PortalStateService } from '../../services/portal-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-4xl" style="font-family: var(--portal-font-family, 'Fira Sans', sans-serif)">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p class="text-sm text-gray-500 mt-1">Profil, Darstellung und Menuekonfiguration verwalten</p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab.key"
                class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                [ngClass]="activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Profil -->
      <ng-container *ngIf="activeTab === 'profil'">
        <!-- Profil -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Profil</h2>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                   [style.background-color]="themeData().primaryColor">SM</div>
              <div>
                <p class="text-base font-semibold text-gray-900">Sabine Mueller</p>
                <p class="text-sm text-gray-500">Administratorin</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                <input type="text" [(ngModel)]="profile.name"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--portal-primary,#006EC7)]"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">E-Mail</label>
                <input type="email" [(ngModel)]="profile.email"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--portal-primary,#006EC7)]"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Benachrichtigungen -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Benachrichtigungen</h2>
          </div>
          <div class="p-5 space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">E-Mail-Benachrichtigungen</p>
                <p class="text-xs text-gray-500 mt-0.5">Benachrichtigungen per E-Mail erhalten</p>
              </div>
              <button (click)="notifications.email = !notifications.email"
                      class="relative w-11 h-6 rounded-full transition-colors duration-200"
                      [style.background-color]="notifications.email ? themeData().primaryColor : '#D1D5DB'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                      [ngClass]="notifications.email ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">Push-Benachrichtigungen</p>
                <p class="text-xs text-gray-500 mt-0.5">Browser-Push-Nachrichten erhalten</p>
              </div>
              <button (click)="notifications.push = !notifications.push"
                      class="relative w-11 h-6 rounded-full transition-colors duration-200"
                      [style.background-color]="notifications.push ? themeData().primaryColor : '#D1D5DB'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                      [ngClass]="notifications.push ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sicherheit -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Sicherheit</h2>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Aktuelles Passwort</label>
              <input type="password" [(ngModel)]="password.current" placeholder="Aktuelles Passwort eingeben"
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Neues Passwort</label>
                <input type="password" [(ngModel)]="password.newPw" placeholder="Neues Passwort"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Passwort bestaetigen</label>
                <input type="password" [(ngModel)]="password.confirm" placeholder="Passwort wiederholen"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
            </div>
            <button class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    [style.background-color]="themeData().primaryColor">
              Passwort aendern
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Tab: Darstellung (Theme) -->
      <ng-container *ngIf="activeTab === 'darstellung'">
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Portal-Identitaet</h2>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Portal-Titel</label>
                <input type="text" [(ngModel)]="themeEdit.portalTitle"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Icon-Initialen</label>
                <input type="text" [(ngModel)]="themeEdit.portalIconInitials" maxlength="5"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Icon-URL (optional)</label>
              <input type="text" [(ngModel)]="themeEdit.portalIconUrl" placeholder="https://..."
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
            </div>
            <!-- Preview -->
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                   [style.background-color]="themeEdit.primaryColor">
                {{ themeEdit.portalIconInitials }}
              </div>
              <span class="text-base font-semibold text-gray-800">{{ themeEdit.portalTitle }}</span>
            </div>
          </div>
        </div>

        <!-- Primary Colors -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Primaerfarben</h2>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div *ngFor="let c of primaryColors">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ c.label }}</label>
                <div class="flex items-center gap-2">
                  <input type="color" [ngModel]="themeEdit[c.key]" (ngModelChange)="themeEdit[c.key] = $event"
                         class="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0"/>
                  <input type="text" [ngModel]="themeEdit[c.key]" (ngModelChange)="themeEdit[c.key] = $event"
                         class="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono"/>
                </div>
              </div>
            </div>
            <!-- Preview bar -->
            <div class="flex mt-4 rounded-lg overflow-hidden h-8">
              <div class="flex-1" [style.background-color]="themeEdit.primaryDark"></div>
              <div class="flex-1" [style.background-color]="themeEdit.primaryColor"></div>
              <div class="flex-1" [style.background-color]="themeEdit.primaryLight"></div>
              <div class="flex-1 border" [style.background-color]="themeEdit.primaryContrast"></div>
            </div>
          </div>
        </div>

        <!-- Secondary Colors -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Sekundaerfarben</h2>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div *ngFor="let c of secondaryColors">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ c.label }}</label>
                <div class="flex items-center gap-2">
                  <input type="color" [ngModel]="themeEdit[c.key]" (ngModelChange)="themeEdit[c.key] = $event"
                         class="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0"/>
                  <input type="text" [ngModel]="themeEdit[c.key]" (ngModelChange)="themeEdit[c.key] = $event"
                         class="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono"/>
                </div>
              </div>
            </div>
            <div class="flex mt-4 rounded-lg overflow-hidden h-8">
              <div class="flex-1" [style.background-color]="themeEdit.secondaryDark"></div>
              <div class="flex-1" [style.background-color]="themeEdit.secondaryColor"></div>
              <div class="flex-1" [style.background-color]="themeEdit.secondaryLight"></div>
              <div class="flex-1 border" [style.background-color]="themeEdit.secondaryContrast"></div>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Schrift</h2>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Schriftart (Text)</label>
                <select [(ngModel)]="themeEdit.fontFamily"
                        class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="Fira Sans">Fira Sans</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Nunito">Nunito</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Schriftart (Ueberschriften)</label>
                <select [(ngModel)]="themeEdit.fontFamilyHeading"
                        class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="Fira Sans Condensed">Fira Sans Condensed</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto Condensed">Roboto Condensed</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Schriftfarbe</label>
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="themeEdit.fontColor"
                         class="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0"/>
                  <input type="text" [(ngModel)]="themeEdit.fontColor"
                         class="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono"/>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Schriftfarbe (hell)</label>
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="themeEdit.fontColorLight"
                         class="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0"/>
                  <input type="text" [(ngModel)]="themeEdit.fontColorLight"
                         class="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-mono"/>
                </div>
              </div>
            </div>
            <!-- Font preview -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-lg font-bold mb-1" [style.font-family]="themeEdit.fontFamilyHeading + ', sans-serif'" [style.color]="themeEdit.fontColor">Ueberschrift Vorschau</p>
              <p class="text-sm" [style.font-family]="themeEdit.fontFamily + ', sans-serif'" [style.color]="themeEdit.fontColor">Dies ist eine Vorschau des Fliesstextes in der gewaehlten Schriftart.</p>
              <p class="text-xs mt-1" [style.font-family]="themeEdit.fontFamily + ', sans-serif'" [style.color]="themeEdit.fontColorLight">Sekundaerer Text in heller Schriftfarbe</p>
            </div>
          </div>
        </div>

        <!-- Save Theme -->
        <div class="flex justify-end gap-3">
          <button (click)="resetTheme()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Zuruecksetzen
          </button>
          <button (click)="saveTheme()" class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  [style.background-color]="themeEdit.primaryColor">
            Theme speichern
          </button>
        </div>
      </ng-container>

      <!-- Tab: Menue -->
      <ng-container *ngIf="activeTab === 'menue'">
        <!-- Custom Menu Items -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">Benutzerdefinierte Menuepunkte</h2>
            <button (click)="showAddMenu = true"
                    class="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                    [style.background-color]="themeData().primaryColor">
              + Hinzufuegen
            </button>
          </div>
          <div class="p-5">
            <div *ngIf="customMenuItems().length === 0" class="text-center py-8 text-gray-400 text-sm">
              Keine benutzerdefinierten Menuepunkte vorhanden
            </div>
            <ul class="space-y-2">
              <li *ngFor="let item of customMenuItems(); let i = index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                <span class="text-gray-400 cursor-grab">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/>
                  </svg>
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.label }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ item.menuType }} — {{ item.url || 'Keine URL' }}</p>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      [ngClass]="item.visible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'">
                  {{ item.visible ? 'Sichtbar' : 'Versteckt' }}
                </span>
                <button (click)="editMenuItem(item)" class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button (click)="deleteMenuItem(item.id)" class="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Add/Edit Menu Item Dialog -->
        <div *ngIf="showAddMenu" class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">{{ editingMenuItem ? 'Menuepunkt bearbeiten' : 'Neuer Menuepunkt' }}</h2>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Bezeichnung</label>
                <input type="text" [(ngModel)]="menuForm.label"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Typ</label>
                <select [(ngModel)]="menuForm.menuType"
                        class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="IFRAME">iFrame</option>
                  <option value="LINK">Externer Link</option>
                  <option value="SEPARATOR">Trennlinie</option>
                </select>
              </div>
            </div>
            <div *ngIf="menuForm.menuType !== 'SEPARATOR'">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">URL</label>
              <input type="url" [(ngModel)]="menuForm.url" placeholder="https://..."
                     class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Icon</label>
                <input type="text" [(ngModel)]="menuForm.icon" placeholder="link"
                       class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"/>
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="menuForm.visible" class="w-4 h-4 rounded"/>
                  <span class="text-sm text-gray-700">Sichtbar</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button (click)="cancelMenuForm()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Abbrechen</button>
              <button (click)="saveMenuItem()" class="px-4 py-2 text-sm font-medium text-white rounded-lg"
                      [style.background-color]="themeData().primaryColor">
                {{ editingMenuItem ? 'Aktualisieren' : 'Erstellen' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Menu Order -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Menue-Reihenfolge</h2>
            <p class="text-xs text-gray-500 mt-1">Standard-Menuepunkte ein-/ausblenden und sortieren</p>
          </div>
          <div class="p-5">
            <ul class="space-y-2">
              <li *ngFor="let item of menuOrder; let i = index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex flex-col gap-0.5">
                  <button (click)="moveMenuUp(i)" [disabled]="i === 0" class="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button (click)="moveMenuDown(i)" [disabled]="i === menuOrder.length - 1" class="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
                <span class="flex-1 text-sm font-medium text-gray-900">{{ item.menuItemKey }}</span>
                <button (click)="item.visible = !item.visible"
                        class="relative w-9 h-5 rounded-full transition-colors duration-200"
                        [style.background-color]="item.visible ? themeData().primaryColor : '#D1D5DB'">
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
                        [ngClass]="item.visible ? 'translate-x-4' : 'translate-x-0'"></span>
                </button>
              </li>
            </ul>
            <div class="flex justify-end mt-4">
              <button (click)="saveMenuOrder()" class="px-4 py-2 text-sm font-medium text-white rounded-lg"
                      [style.background-color]="themeData().primaryColor">
                Reihenfolge speichern
              </button>
            </div>
          </div>
        </div>
      </ng-container>

    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly menuService = inject(CustomMenuService);
  private readonly portalState = inject(PortalStateService);

  readonly themeData = this.themeService.theme;
  readonly customMenuItems = signal<CustomMenuItem[]>([]);

  activeTab: 'profil' | 'darstellung' | 'menue' = 'profil';
  tabs = [
    { key: 'profil' as const, label: 'Profil' },
    { key: 'darstellung' as const, label: 'Darstellung' },
    { key: 'menue' as const, label: 'Menue' },
  ];

  profile = { name: 'Sabine Mueller', email: 'sabine.mueller@health-portal.de' };
  notifications = { email: true, push: false, digest: 'woechentlich' };
  password = { current: '', newPw: '', confirm: '' };

  themeEdit: Record<string, any> = {};
  showAddMenu = false;
  editingMenuItem: CustomMenuItem | null = null;
  menuForm = { label: '', menuType: 'IFRAME', url: '', icon: 'link', visible: true };

  primaryColors = [
    { key: 'primaryColor', label: 'Primaer' },
    { key: 'primaryDark', label: 'Dunkel' },
    { key: 'primaryLight', label: 'Hell' },
    { key: 'primaryContrast', label: 'Kontrast' },
  ];

  secondaryColors = [
    { key: 'secondaryColor', label: 'Sekundaer' },
    { key: 'secondaryDark', label: 'Dunkel' },
    { key: 'secondaryLight', label: 'Hell' },
    { key: 'secondaryContrast', label: 'Kontrast' },
  ];

  menuOrder: MenuOrderConfig[] = [];

  private readonly defaultMenuItems = [
    'dashboard', 'nachrichten', 'installierte-anwendungen', 'plattform',
    'formulare', 'ki-agenten', 'einstellungen'
  ];

  ngOnInit(): void {
    this.resetTheme();
    this.loadCustomMenuItems();
    this.loadMenuOrder();
  }

  resetTheme(): void {
    this.themeEdit = { ...this.themeData() };
  }

  saveTheme(): void {
    this.themeService.saveTheme(this.themeEdit as any);
  }

  loadCustomMenuItems(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.menuService.getAll(tenantId).subscribe({
      next: (items) => this.customMenuItems.set(items),
      error: () => this.customMenuItems.set([]),
    });
  }

  loadMenuOrder(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    this.menuService.getMenuOrder(tenantId).subscribe({
      next: (configs) => {
        if (configs.length > 0) {
          this.menuOrder = configs;
        } else {
          this.menuOrder = this.defaultMenuItems.map((key, i) => ({
            id: '', tenantId, menuItemKey: key, sortOrder: i, visible: true
          }));
        }
      },
      error: () => {
        this.menuOrder = this.defaultMenuItems.map((key, i) => ({
          id: '', tenantId: this.portalState.currentTenantSnapshot.id, menuItemKey: key, sortOrder: i, visible: true
        }));
      }
    });
  }

  editMenuItem(item: CustomMenuItem): void {
    this.editingMenuItem = item;
    this.menuForm = { label: item.label, menuType: item.menuType, url: item.url || '', icon: item.icon, visible: item.visible };
    this.showAddMenu = true;
  }

  cancelMenuForm(): void {
    this.showAddMenu = false;
    this.editingMenuItem = null;
    this.menuForm = { label: '', menuType: 'IFRAME', url: '', icon: 'link', visible: true };
  }

  saveMenuItem(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    if (this.editingMenuItem) {
      this.menuService.update(this.editingMenuItem.id, { ...this.menuForm, tenantId } as any).subscribe({
        next: () => { this.cancelMenuForm(); this.loadCustomMenuItems(); }
      });
    } else {
      this.menuService.create({ ...this.menuForm, tenantId } as any).subscribe({
        next: () => { this.cancelMenuForm(); this.loadCustomMenuItems(); }
      });
    }
  }

  deleteMenuItem(id: string): void {
    this.menuService.delete(id).subscribe({
      next: () => this.loadCustomMenuItems()
    });
  }

  moveMenuUp(i: number): void {
    if (i > 0) {
      [this.menuOrder[i - 1], this.menuOrder[i]] = [this.menuOrder[i], this.menuOrder[i - 1]];
    }
  }

  moveMenuDown(i: number): void {
    if (i < this.menuOrder.length - 1) {
      [this.menuOrder[i], this.menuOrder[i + 1]] = [this.menuOrder[i + 1], this.menuOrder[i]];
    }
  }

  saveMenuOrder(): void {
    const tenantId = this.portalState.currentTenantSnapshot.id;
    const configs = this.menuOrder.map((item, i) => ({ ...item, sortOrder: i, tenantId }));
    this.menuService.saveMenuOrder(tenantId, configs).subscribe({
      next: (saved) => this.menuOrder = saved
    });
  }
}
