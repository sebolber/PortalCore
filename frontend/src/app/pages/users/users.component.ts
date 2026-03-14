import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PortalUser, UserAdresse } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Tenant } from '../../models/tenant.model';
import { API_URL } from '../../services/api.service';
import { RollenTabComponent } from './rollen-tab.component';
import { BerechtigungenTabComponent } from './berechtigungen-tab.component';
import { AuditTabComponent } from './audit-tab.component';
import { ROLLEN, BERECHTIGUNGEN, AUDIT_TRAIL } from './users-stammdaten';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RollenTabComponent, BerechtigungenTabComponent, AuditTabComponent],
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
              {{ tab.key === 'benutzer' ? users().length : tab.count }}
            </span>
          </button>
        }
      </div>

      <!-- Tab 1: Benutzer -->
      @if (activeTab() === 'benutzer') {
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          @for (stat of computedStats(); track stat.label) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-card">
              <div class="text-2xl font-semibold" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- Filters + Benutzer anlegen -->
        <div class="flex flex-wrap gap-3 mb-4 items-center">
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
            @for (t of tenantNames(); track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          <div class="flex-1"></div>
          <button
            (click)="openCreateForm()"
            class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Benutzer anlegen
          </button>
        </div>

        <!-- Fehlermeldung -->
        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error flex items-center justify-between">
            <span>{{ errorMessage() }}</span>
            <button (click)="errorMessage.set('')" class="text-error hover:text-error/80">&times;</button>
          </div>
        }

        <!-- Erfolgsmeldung -->
        @if (successMessage()) {
          <div class="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success flex items-center justify-between">
            <span>{{ successMessage() }}</span>
            <button (click)="successMessage.set('')" class="text-success hover:text-success/80">&times;</button>
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span class="ml-3 text-sm text-gray-500">Lade Benutzer...</span>
          </div>
        }

        <!-- Users Table -->
        @if (!loading()) {
          <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden overflow-x-auto">
            <table class="w-full text-sm min-w-[800px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Mandant</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Abteilung</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Letzter Login</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">IAM</th>
                  <th class="px-4 py-3 w-10"></th>
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
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ user.abteilung || '-' }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ user.letzterLogin || '-' }}</td>
                    <td class="px-4 py-3">
                      <span class="w-2.5 h-2.5 rounded-full inline-block"
                        [class]="user.iamSync ? 'bg-success' : 'bg-gray-300'"
                        [title]="user.iamSync ? 'Synchronisiert' : 'Nicht synchronisiert'">
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button
                        (click)="openEditForm(user); $event.stopPropagation()"
                        class="text-gray-400 hover:text-primary transition-colors p-1"
                        title="Bearbeiten"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
                @if (filteredUsers().length === 0) {
                  <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-400 text-sm">Keine Benutzer gefunden</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Detail Panel (Anzeige) -->
        @if (selectedUser() && !formMode()) {
          <div class="mt-4 bg-white rounded-lg border border-gray-200 shadow-card p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                  {{ selectedUser()!.initialen }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ selectedUser()!.vorname }} {{ selectedUser()!.nachname }}</h3>
                  <p class="text-sm text-gray-500">{{ selectedUser()!.email }}</p>
                  @if (selectedUser()!.positionTitel) {
                    <p class="text-xs text-gray-400 mt-0.5">{{ selectedUser()!.positionTitel }} · {{ selectedUser()!.abteilung }}</p>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="openEditForm(selectedUser()!)" class="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                  Bearbeiten
                </button>
                <button (click)="confirmDelete(selectedUser()!)" class="px-3 py-1.5 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors">
                  Loeschen
                </button>
                <button (click)="selectedUser.set(null)" class="text-gray-400 hover:text-gray-600 text-xl ml-2">&times;</button>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div class="text-gray-500 text-xs mb-1">Status</div>
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" [class]="statusClass(selectedUser()!.status)">{{ selectedUser()!.status }}</span>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Mandant</div>
                <div class="text-gray-900">{{ selectedUser()!.mandant }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Telefon</div>
                <div class="text-gray-900">{{ selectedUser()!.telefon || '-' }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Letzter Login</div>
                <div class="text-gray-900">{{ selectedUser()!.letzterLogin || '-' }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Sprache</div>
                <div class="text-gray-900">{{ getSprachLabel(selectedUser()!.sprache || 'de') }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Zeitzone</div>
                <div class="text-gray-900">{{ selectedUser()!.zeitzone || 'Europe/Berlin' }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">Erstellt am</div>
                <div class="text-gray-900">{{ selectedUser()!.erstelltAm }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1">IAM ID</div>
                <div class="text-gray-900 font-mono text-xs">{{ selectedUser()!.iamId }}</div>
              </div>
            </div>
          </div>
        }

        <!-- Loeschen-Bestaetigung -->
        @if (deleteConfirmUser()) {
          <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-modal p-6 max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Benutzer loeschen?</h3>
              <p class="text-sm text-gray-600 mb-4">
                Soll der Benutzer <strong>{{ deleteConfirmUser()!.vorname }} {{ deleteConfirmUser()!.nachname }}</strong> unwiderruflich geloescht werden?
              </p>
              <div class="flex justify-end gap-3">
                <button (click)="deleteConfirmUser.set(null)" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
                <button (click)="doDelete()" class="px-4 py-2 text-sm text-white bg-error hover:bg-error/90 rounded-lg transition-colors">Loeschen</button>
              </div>
            </div>
          </div>
        }

        <!-- Erstellen / Bearbeiten Formular -->
        @if (formMode()) {
          <div class="mt-4 bg-white rounded-lg border border-gray-200 shadow-card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-condensed font-semibold text-gray-900">
                {{ formMode() === 'create' ? 'Neuen Benutzer anlegen' : 'Benutzer bearbeiten' }}
              </h3>
              <button (click)="cancelForm()" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <!-- Persoenliche Daten -->
            <fieldset class="mb-6">
              <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                Persoenliche Daten
              </legend>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Anrede</label>
                  <select [(ngModel)]="formData.anrede" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">Keine Angabe</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Divers">Divers</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Vorname *</label>
                  <input type="text" [(ngModel)]="formData.vorname" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Nachname *</label>
                  <input type="text" [(ngModel)]="formData.nachname" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">E-Mail *</label>
                  <input type="email" [(ngModel)]="formData.email" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Telefon</label>
                  <input type="tel" [(ngModel)]="formData.telefon" placeholder="+49 123 4567890" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Abteilung</label>
                  <input type="text" [(ngModel)]="formData.abteilung" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Position / Funktion</label>
                  <input type="text" [(ngModel)]="formData.positionTitel" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
            </fieldset>

            <!-- Mandant & Konto -->
            <fieldset class="mb-6">
              <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent-violet"></span>
                Mandant & Konto
              </legend>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Mandant *</label>
                  <select [(ngModel)]="formData.mandantId" (ngModelChange)="onMandantChange($event)" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">Bitte waehlen</option>
                    @for (t of availableTenants(); track t.id) {
                      <option [value]="t.id">{{ t.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Kontostatus</label>
                  <select [(ngModel)]="formData.status" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="aktiv">Aktiv</option>
                    <option value="inaktiv">Inaktiv</option>
                    <option value="gesperrt">Gesperrt</option>
                  </select>
                </div>
                @if (formMode() === 'edit') {
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Fehlgeschlagene Logins</label>
                    <input type="number" [ngModel]="formData.fehlgeschlageneLogins" readonly class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Letzter Login</label>
                    <input type="text" [ngModel]="formData.letzterLogin" readonly class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Letzte Login-IP</label>
                    <input type="text" [ngModel]="formData.letzteLoginIp" readonly class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                  </div>
                }
              </div>
            </fieldset>

            <!-- Einstellungen -->
            <fieldset class="mb-6">
              <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent-turquoise"></span>
                Einstellungen
              </legend>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Sprache</label>
                  <select [(ngModel)]="formData.sprache" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    @for (s of sprachen; track s.code) {
                      <option [value]="s.code">{{ s.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Zeitzone</label>
                  <select [(ngModel)]="formData.zeitzone" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    @for (tz of zeitzonen; track tz) {
                      <option [value]="tz">{{ tz }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Design</label>
                  <select [(ngModel)]="formData.darkMode" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option [ngValue]="false">Hell</option>
                    <option [ngValue]="true">Dunkel</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Standard-Dashboard</label>
                  <input type="text" [(ngModel)]="formData.standardDashboard" placeholder="z.B. Uebersicht" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.emailBenachrichtigungen" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span class="text-sm text-gray-700">E-Mail-Benachrichtigungen</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.pushBenachrichtigungen" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span class="text-sm text-gray-700">Push-Benachrichtigungen</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.smsBenachrichtigungen" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span class="text-sm text-gray-700">SMS-Benachrichtigungen</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.newsletterEinwilligung" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span class="text-sm text-gray-700">Newsletter-Einwilligung</span>
                </label>
              </div>
            </fieldset>

            <!-- Delegationsrechte & Stellvertretung -->
            <fieldset class="mb-6">
              <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent-orange"></span>
                Delegationsrechte & Stellvertretung
              </legend>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.delegationsrechte" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span class="text-sm text-gray-700">Delegationsrechte aktiviert</span>
                </label>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Stellvertreter</label>
                  <select multiple [(ngModel)]="formData.stellvertreterIds" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-20">
                    @for (u of users(); track u.id) {
                      @if (u.id !== formData.id) {
                        <option [value]="u.id">{{ u.vorname }} {{ u.nachname }}</option>
                      }
                    }
                  </select>
                  <p class="text-[10px] text-gray-400 mt-1">Strg/Cmd gehalten fuer Mehrfachauswahl</p>
                </div>
              </div>
            </fieldset>

            <!-- Meta-Info (nur bei Bearbeiten) -->
            @if (formMode() === 'edit') {
              <fieldset class="mb-6">
                <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                  Meta-Info (nur lesen)
                </legend>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Erstellt am</label>
                    <div class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{{ formData.erstelltAm || '-' }}</div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Letzte Aenderung</label>
                    <div class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{{ formData.letzteAenderungAm || '-' }}</div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Erstellt von</label>
                    <div class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{{ formData.erstelltVon || '-' }}</div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Zuletzt geaendert von</label>
                    <div class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{{ formData.zuletztGeaendertVon || '-' }}</div>
                  </div>
                </div>
              </fieldset>
            }

            <!-- Adressen -->
            <fieldset class="mb-6">
              <legend class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent-pink"></span>
                Adressen
              </legend>

              @if (formData.adressen && formData.adressen.length > 0) {
                <div class="space-y-3 mb-4">
                  @for (adr of formData.adressen; track adr.id; let i = $index) {
                    <div class="border border-gray-200 rounded-lg p-4 relative" [class.border-primary]="adr.istHauptadresse">
                      @if (adr.istHauptadresse) {
                        <span class="absolute top-2 right-12 text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Hauptadresse</span>
                      }
                      <button (click)="removeAdresse(i)" class="absolute top-2 right-2 text-gray-400 hover:text-error text-lg">&times;</button>
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Typ</label>
                          <select [(ngModel)]="adr.typ" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="Hauptadresse">Hauptadresse</option>
                            <option value="Zustelladresse">Zustelladresse</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Bezeichnung</label>
                          <input type="text" [(ngModel)]="adr.bezeichnung" placeholder="z.B. Buero" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Strasse</label>
                          <input type="text" [(ngModel)]="adr.strasse" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Hausnummer</label>
                          <input type="text" [(ngModel)]="adr.hausnummer" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">PLZ</label>
                          <input type="text" [(ngModel)]="adr.plz" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Ort</label>
                          <input type="text" [(ngModel)]="adr.ort" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Land</label>
                          <input type="text" [(ngModel)]="adr.land" value="Deutschland" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Zusatz</label>
                          <input type="text" [(ngModel)]="adr.zusatz" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                      </div>
                      <label class="flex items-center gap-2 mt-3 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="adr.istHauptadresse" (ngModelChange)="onHauptadresseChange(i)" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                        <span class="text-xs text-gray-600">Als Hauptadresse markieren</span>
                      </label>
                    </div>
                  }
                </div>
              }

              <button (click)="addAdresse()" class="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg border border-dashed border-primary/40 transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Adresse hinzufuegen
              </button>
            </fieldset>

            <!-- Validierungsfehler -->
            @if (formError()) {
              <div class="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">{{ formError() }}</div>
            }

            <!-- Aktionen -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button (click)="cancelForm()" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Zurueck
              </button>
              <button (click)="saveUser()" [disabled]="saving()" class="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50">
                @if (saving()) {
                  <span class="flex items-center gap-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Speichere...
                  </span>
                } @else {
                  {{ formMode() === 'create' ? 'Anlegen' : 'Speichern' }}
                }
              </button>
            </div>
          </div>
        }
      }

      <!-- Tab 2: Rollen -->
      @if (activeTab() === 'rollen') {
        <app-rollen-tab [rollen]="rollen" [berechtigungen]="berechtigungen" [users]="users()"></app-rollen-tab>
      }

      <!-- Tab 3: Berechtigungen -->
      @if (activeTab() === 'berechtigungen') {
        <app-berechtigungen-tab [berechtigungen]="berechtigungen"></app-berechtigungen-tab>
      }

      <!-- Tab 4: Audit-Trail -->
      @if (activeTab() === 'audit') {
        <app-audit-tab [auditTrail]="auditTrail"></app-audit-tab>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly http = inject(HttpClient);

  readonly activeTab = signal<'benutzer' | 'rollen' | 'berechtigungen' | 'audit'>('benutzer');
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly tenantFilter = signal('');
  readonly selectedUser = signal<PortalUser | null>(null);
  readonly formMode = signal<'create' | 'edit' | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly formError = signal('');
  readonly deleteConfirmUser = signal<PortalUser | null>(null);
  readonly users = signal<PortalUser[]>([]);

  formData: Partial<PortalUser> & { adressen: UserAdresse[] } = this.emptyFormData();

  readonly tabs = [
    { key: 'benutzer' as const, label: 'Benutzer', count: 0 },
    { key: 'rollen' as const, label: 'Rollen', count: 7 },
    { key: 'berechtigungen' as const, label: 'Berechtigungen', count: 31 },
    { key: 'audit' as const, label: 'Audit-Trail', count: 15 },
  ];

  readonly availableTenants = signal<Tenant[]>([]);

  readonly sprachen = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Francais' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Espanol' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' },
    { code: 'tr', label: 'Tuerkce' },
    { code: 'pt', label: 'Portugues' },
    { code: 'cs', label: 'Cesky' },
  ];

  readonly zeitzonen = [
    'Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/London',
    'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam',
    'Europe/Warsaw', 'Europe/Prague', 'Europe/Istanbul',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles',
    'Asia/Tokyo', 'Asia/Shanghai',
  ];

  readonly rollen = ROLLEN;
  readonly berechtigungen = BERECHTIGUNGEN;
  readonly auditTrail = AUDIT_TRAIL;

  readonly computedStats = computed(() => {
    const all = this.users();
    const aktiv = all.filter(u => u.status === 'aktiv').length;
    const inaktiv = all.filter(u => u.status === 'inaktiv').length;
    const gesperrt = all.filter(u => u.status === 'gesperrt').length;
    const mandanten = new Set(all.map(u => u.mandantId)).size;
    return [
      { label: 'Gesamt', value: all.length, color: '#006EC7' },
      { label: 'Aktiv', value: aktiv, color: '#28A745' },
      { label: 'Inaktiv', value: inaktiv, color: '#887D75' },
      { label: 'Gesperrt', value: gesperrt, color: '#CC3333' },
      { label: 'Mandanten', value: mandanten, color: '#461EBE' },
      { label: 'Rollen', value: this.rollen.length, color: '#28DCAA' },
    ];
  });

  readonly tenantNames = computed(() => {
    const names = new Set(this.users().map(u => u.mandant));
    return Array.from(names);
  });

  readonly filteredUsers = computed(() => {
    let result = this.users();
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

  ngOnInit(): void {
    this.loadUsers();
    this.loadTenants();
  }

  loadTenants(): void {
    this.http.get<Tenant[]>(`${API_URL}/tenants`).subscribe({
      next: (data) => this.availableTenants.set(data),
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Benutzer konnten nicht geladen werden. Bitte spaeter erneut versuchen.');
        this.loading.set(false);
      },
    });
  }

  selectUser(user: PortalUser): void {
    if (this.formMode()) return;
    this.selectedUser.set(this.selectedUser()?.id === user.id ? null : user);
  }

  openCreateForm(): void {
    this.selectedUser.set(null);
    this.formData = this.emptyFormData();
    this.formError.set('');
    this.formMode.set('create');
  }

  openEditForm(user: PortalUser): void {
    this.formData = {
      ...user,
      adressen: user.adressen ? [...user.adressen.map(a => ({ ...a }))] : [],
      stellvertreterIds: user.stellvertreterIds ? [...user.stellvertreterIds] : [],
    };
    this.formError.set('');
    this.formMode.set('edit');
  }

  cancelForm(): void {
    this.formMode.set(null);
    this.formError.set('');
  }

  confirmDelete(user: PortalUser): void {
    this.deleteConfirmUser.set(user);
  }

  doDelete(): void {
    const user = this.deleteConfirmUser();
    if (!user) return;
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.deleteConfirmUser.set(null);
        this.selectedUser.set(null);
        this.successMessage.set(`Benutzer ${user.vorname} ${user.nachname} wurde geloescht.`);
        this.loadUsers();
      },
      error: (err) => {
        this.deleteConfirmUser.set(null);
        this.errorMessage.set(err.error?.message || err.error?.error || 'Benutzer konnte nicht geloescht werden.');
      },
    });
  }

  saveUser(): void {
    this.formError.set('');

    if (!this.formData.vorname?.trim()) {
      this.formError.set('Vorname ist ein Pflichtfeld.');
      return;
    }
    if (!this.formData.nachname?.trim()) {
      this.formError.set('Nachname ist ein Pflichtfeld.');
      return;
    }
    if (!this.formData.email?.trim()) {
      this.formError.set('E-Mail ist ein Pflichtfeld.');
      return;
    }
    if (!this.formData.mandantId) {
      this.formError.set('Mandant muss ausgewaehlt werden.');
      return;
    }

    const hauptadressen = (this.formData.adressen || []).filter(a => a.istHauptadresse);
    if (hauptadressen.length > 1) {
      this.formError.set('Es darf nur eine Hauptadresse geben.');
      return;
    }

    this.saving.set(true);
    const payload: Partial<PortalUser> = { ...this.formData };
    payload.initialen = (this.formData.vorname?.charAt(0) || '') + (this.formData.nachname?.charAt(0) || '');

    if (this.formMode() === 'create') {
      this.userService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.formMode.set(null);
          this.successMessage.set('Benutzer wurde erfolgreich angelegt.');
          this.loadUsers();
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err.error?.message || 'Benutzer konnte nicht angelegt werden.');
        },
      });
    } else {
      this.userService.update(this.formData.id!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.formMode.set(null);
          this.selectedUser.set(null);
          this.successMessage.set('Benutzer wurde erfolgreich gespeichert.');
          this.loadUsers();
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err.error?.message || 'Benutzer konnte nicht gespeichert werden.');
        },
      });
    }
  }

  onMandantChange(mandantId: string): void {
    const tenant = this.availableTenants().find(t => t.id === mandantId);
    if (tenant) {
      this.formData.mandant = tenant.name;
      this.formData.tenant = tenant;
    }
  }

  addAdresse(): void {
    const newId = 'adr-new-' + Date.now();
    this.formData.adressen.push({
      id: newId,
      typ: 'Zustelladresse',
      bezeichnung: '',
      strasse: '',
      hausnummer: '',
      plz: '',
      ort: '',
      land: 'Deutschland',
      zusatz: '',
      istHauptadresse: false,
    });
  }

  removeAdresse(index: number): void {
    this.formData.adressen.splice(index, 1);
  }

  onHauptadresseChange(changedIndex: number): void {
    if (this.formData.adressen[changedIndex].istHauptadresse) {
      this.formData.adressen.forEach((a, i) => {
        if (i !== changedIndex) a.istHauptadresse = false;
      });
    }
  }

  getSprachLabel(code: string): string {
    return this.sprachen.find(s => s.code === code)?.label ?? code;
  }

  getRolleName(id: string): string {
    return this.rollen.find(r => r.id === id)?.name ?? id;
  }

  getRolleColor(id: string): string {
    return this.rollen.find(r => r.id === id)?.farbe ?? '#887D75';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'aktiv': return 'bg-success/10 text-success';
      case 'inaktiv': return 'bg-gray-100 text-gray-500';
      case 'gesperrt': return 'bg-error/10 text-error';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  private emptyFormData(): Partial<PortalUser> & { adressen: UserAdresse[] } {
    return {
      anrede: '',
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      abteilung: '',
      positionTitel: '',
      mandant: '',
      mandantId: '',
      status: 'aktiv',
      sprache: 'de',
      zeitzone: 'Europe/Berlin',
      darkMode: false,
      standardDashboard: '',
      emailBenachrichtigungen: true,
      pushBenachrichtigungen: false,
      smsBenachrichtigungen: false,
      newsletterEinwilligung: false,
      delegationsrechte: false,
      stellvertreterIds: [],
      adressen: [],
      rollenIds: [],
      iamId: '',
      iamSync: false,
    };
  }
}
