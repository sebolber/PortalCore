import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NachrichtItem, NachrichtTyp, NachrichtPrioritaet, NachrichtErstellen } from '../../models/nachricht.model';
import { NachrichtService } from '../../services/nachricht.service';
import { UserService } from '../../services/user.service';
import { PortalUser } from '../../models/user.model';

type Ordner = 'posteingang' | 'gesendet' | 'archiv';
type TypFilter = 'alle' | 'NACHRICHT' | 'AUFGABE';

@Component({
  selector: 'app-nachrichtencenter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-[calc(100vh-5rem)] -m-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Left Sidebar: Folders + Compose -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <!-- Compose Button -->
        <div class="p-4">
          <button (click)="openVerfassen()"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006EC7] text-white text-sm font-medium rounded-xl hover:bg-[#005ba3] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Verfassen
          </button>
        </div>

        <!-- Folders -->
        <nav class="flex-1 px-2">
          <button (click)="setOrdner('posteingang')"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                  [ngClass]="activeOrdner() === 'posteingang'
                    ? 'bg-blue-50 text-[#006EC7] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <span class="flex-1 text-left">Posteingang</span>
            <span *ngIf="ungelesenAnzahl() > 0"
                  class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#006EC7] text-white">
              {{ ungelesenAnzahl() }}
            </span>
          </button>

          <button (click)="setOrdner('gesendet')"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                  [ngClass]="activeOrdner() === 'gesendet'
                    ? 'bg-blue-50 text-[#006EC7] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span class="flex-1 text-left">Gesendet</span>
          </button>

          <button (click)="setOrdner('archiv')"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                  [ngClass]="activeOrdner() === 'archiv'
                    ? 'bg-blue-50 text-[#006EC7] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
            <span class="flex-1 text-left">Archiv</span>
          </button>

          <!-- Divider -->
          <hr class="my-3 border-gray-200">

          <!-- Type Filter -->
          <p class="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Filter</p>
          <button *ngFor="let f of typFilters"
                  (click)="activeTypFilter.set(f.value)"
                  class="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5"
                  [ngClass]="activeTypFilter() === f.value
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-50'">
            <span class="w-2 h-2 rounded-full shrink-0" [ngClass]="f.color"></span>
            {{ f.label }}
          </button>
        </nav>
      </div>

      <!-- Middle: Message List -->
      <div class="w-96 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0"
           *ngIf="!showVerfassen()">
        <!-- Header -->
        <div class="p-4 bg-white border-b border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-900">{{ getOrdnerLabel() }}</h2>
            <button *ngIf="activeOrdner() === 'posteingang'"
                    (click)="alleAlsGelesen()"
                    class="text-xs text-[#006EC7] hover:underline">
              Alle gelesen
            </button>
          </div>
          <!-- Search -->
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Suchen..."
                   [(ngModel)]="searchQuery"
                   class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
          </div>
        </div>

        <!-- Message List -->
        <div class="flex-1 overflow-y-auto">
          <div *ngFor="let item of filteredItems()" (click)="selectItem(item)"
               class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors"
               [ngClass]="{
                 'bg-white': selectedItem()?.id === item.id,
                 'border-l-3 border-l-[#006EC7]': !item.gelesen && activeOrdner() === 'posteingang'
               }">
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                   [ngClass]="item.typ === 'AUFGABE' ? 'bg-amber-500' : 'bg-[#006EC7]'">
                {{ item.erstellerInitialen }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm truncate"
                        [ngClass]="item.gelesen ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'">
                    {{ item.erstellerName }}
                  </span>
                  <span class="text-[11px] text-gray-400 shrink-0">{{ formatZeit(item.erstelltAm) }}</span>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <!-- Type badge -->
                  <span *ngIf="item.typ === 'AUFGABE'"
                        class="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-700 shrink-0">
                    AUFGABE
                  </span>
                  <!-- Priority badge -->
                  <span *ngIf="item.prioritaet === 'HOCH' || item.prioritaet === 'DRINGEND'"
                        class="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0"
                        [ngClass]="item.prioritaet === 'DRINGEND' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                    {{ item.prioritaet === 'DRINGEND' ? '!!' : '!' }}
                  </span>
                  <span class="text-sm truncate" [ngClass]="item.gelesen ? 'text-gray-600' : 'text-gray-900 font-semibold'">
                    {{ item.betreff }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5 truncate">{{ item.inhalt }}</p>
                <!-- Metadata row -->
                <div class="flex items-center gap-2 mt-1">
                  <span *ngIf="item.frist" class="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
                    </svg>
                    {{ formatDatum(item.frist) }}
                  </span>
                  <span *ngIf="item.anhaenge.length > 0" class="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    {{ item.anhaenge.length }}
                  </span>
                  <span *ngIf="item.empfaenger.length > 1" class="text-[10px] text-gray-400">
                    {{ item.empfaenger.length }} Empf.
                  </span>
                </div>
              </div>
              <!-- Unread dot -->
              <div *ngIf="!item.gelesen && activeOrdner() === 'posteingang'"
                   class="w-2 h-2 rounded-full bg-[#006EC7] shrink-0 mt-2"></div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="filteredItems().length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-sm text-gray-500">Keine Eintraege vorhanden</p>
          </div>
        </div>
      </div>

      <!-- Middle: Compose Form (replaces message list) -->
      <div class="w-96 bg-white border-r border-gray-200 flex flex-col shrink-0"
           *ngIf="showVerfassen()">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Neue Nachricht</h2>
          <button (click)="closeVerfassen()" class="p-1 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Type toggle -->
          <div class="flex gap-2">
            <button (click)="neueNachricht.typ = 'NACHRICHT'"
                    class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                    [ngClass]="neueNachricht.typ === 'NACHRICHT'
                      ? 'bg-[#006EC7] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              Nachricht
            </button>
            <button (click)="neueNachricht.typ = 'AUFGABE'"
                    class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                    [ngClass]="neueNachricht.typ === 'AUFGABE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              Aufgabe
            </button>
          </div>

          <!-- Recipients -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">An</label>
            <div class="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[38px]">
              <span *ngFor="let u of selectedEmpfaenger(); let i = index"
                    class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {{ u.vorname }} {{ u.nachname }}
                <button (click)="removeEmpfaenger(i)" class="text-blue-400 hover:text-blue-700">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
              <input type="text" placeholder="Empfaenger suchen..."
                     [(ngModel)]="empfaengerSuche"
                     (focus)="showEmpfaengerDropdown = true"
                     class="flex-1 min-w-[120px] text-sm bg-transparent border-none outline-none"/>
            </div>
            <!-- Dropdown -->
            <div *ngIf="showEmpfaengerDropdown && filteredUsers().length > 0"
                 class="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10 relative">
              <button *ngFor="let user of filteredUsers()"
                      (click)="addEmpfaenger(user)"
                      class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-[10px] font-bold">
                  {{ user.initialen }}
                </div>
                {{ user.vorname }} {{ user.nachname }}
              </button>
            </div>
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">
              {{ neueNachricht.typ === 'AUFGABE' ? 'Aufgabenname' : 'Betreff' }}
            </label>
            <input type="text" [(ngModel)]="neueNachricht.betreff"
                   class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]"/>
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Prioritaet</label>
            <select [(ngModel)]="neueNachricht.prioritaet"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]">
              <option value="NIEDRIG">Niedrig</option>
              <option value="NORMAL">Normal</option>
              <option value="HOCH">Hoch</option>
              <option value="DRINGEND">Dringend</option>
            </select>
          </div>

          <!-- Deadline (for tasks) -->
          <div *ngIf="neueNachricht.typ === 'AUFGABE'">
            <label class="block text-xs font-medium text-gray-500 mb-1">Frist</label>
            <input type="datetime-local" [(ngModel)]="neueNachricht.frist"
                   class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]"/>
          </div>

          <!-- Reminder -->
          <div *ngIf="neueNachricht.typ === 'AUFGABE'">
            <label class="block text-xs font-medium text-gray-500 mb-1">Erinnerung</label>
            <input type="datetime-local" [(ngModel)]="neueNachricht.erinnerungAm"
                   class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7]"/>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Inhalt</label>
            <textarea [(ngModel)]="neueNachricht.inhalt" rows="8"
                      class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] resize-none"></textarea>
          </div>

          <!-- Attachments -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Anhaenge</label>
            <div class="space-y-1">
              <div *ngFor="let f of anhangDateien; let i = index"
                   class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <span class="flex-1 truncate">{{ f.name }}</span>
                <span class="text-[11px] text-gray-400">{{ formatDateigroesse(f.size) }}</span>
                <button (click)="anhangDateien.splice(i, 1)" class="text-gray-400 hover:text-red-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <label class="mt-2 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Datei hinzufuegen
              <input type="file" multiple (change)="onDateiAusgewaehlt($event)" class="hidden"/>
            </label>
          </div>
        </div>

        <!-- Send Button -->
        <div class="p-4 border-t border-gray-200">
          <button (click)="senden()"
                  [disabled]="!canSend()"
                  class="w-full py-2.5 text-sm font-medium rounded-xl transition-colors"
                  [ngClass]="canSend()
                    ? 'bg-[#006EC7] text-white hover:bg-[#005ba3]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
            {{ neueNachricht.typ === 'AUFGABE' ? 'Aufgabe erstellen' : 'Nachricht senden' }}
          </button>
        </div>
      </div>

      <!-- Right: Detail View -->
      <div class="flex-1 bg-white flex flex-col overflow-hidden">
        <!-- No selection -->
        <div *ngIf="!selectedItem() && !showVerfassen()" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm text-gray-400">Waehlen Sie eine Nachricht aus</p>
          </div>
        </div>

        <!-- Detail -->
        <ng-container *ngIf="selectedItem()">
          <!-- Detail Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span *ngIf="selectedItem()!.typ === 'AUFGABE'"
                        class="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-700">
                    AUFGABE
                  </span>
                  <span *ngIf="selectedItem()!.prioritaet === 'HOCH' || selectedItem()!.prioritaet === 'DRINGEND'"
                        class="inline-block px-2 py-0.5 text-[10px] font-bold rounded"
                        [ngClass]="selectedItem()!.prioritaet === 'DRINGEND' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                    {{ selectedItem()!.prioritaet }}
                  </span>
                  <span *ngIf="selectedItem()!.systemGeneriert"
                        class="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600">
                    SYSTEM
                  </span>
                </div>
                <h1 class="text-xl font-bold text-gray-900">{{ selectedItem()!.betreff }}</h1>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <button (click)="toggleGelesen(selectedItem()!)"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        [title]="selectedItem()!.gelesen ? 'Als ungelesen markieren' : 'Als gelesen markieren'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path *ngIf="!selectedItem()!.gelesen" stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    <path *ngIf="selectedItem()!.gelesen" stroke-linecap="round" stroke-linejoin="round" d="M3 19V8l7.89 5.26a2 2 0 002.22 0L21 8v11M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </button>
                <button (click)="doArchivieren(selectedItem()!)"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archivieren">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                  </svg>
                </button>
                <button *ngIf="selectedItem()!.typ === 'AUFGABE'"
                        (click)="doErledigt(selectedItem()!)"
                        class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Als erledigt markieren">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Meta info -->
            <div class="flex items-center gap-4 mt-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                     [ngClass]="selectedItem()!.typ === 'AUFGABE' ? 'bg-amber-500' : 'bg-[#006EC7]'">
                  {{ selectedItem()!.erstellerInitialen }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedItem()!.erstellerName }}</p>
                  <p class="text-xs text-gray-500">{{ formatZeitVoll(selectedItem()!.erstelltAm) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <span>An:</span>
                <span *ngFor="let e of selectedItem()!.empfaenger; let last = last">
                  {{ e.name }}{{ !last ? ', ' : '' }}
                </span>
              </div>
            </div>

            <!-- Task deadline -->
            <div *ngIf="selectedItem()!.frist" class="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
              </svg>
              <span class="text-sm text-amber-800">Frist: {{ formatZeitVoll(selectedItem()!.frist!) }}</span>
            </div>
          </div>

          <!-- Detail Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ selectedItem()!.inhalt }}</div>

            <!-- Attachments -->
            <div *ngIf="selectedItem()!.anhaenge.length > 0" class="mt-6 pt-4 border-t border-gray-100">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {{ selectedItem()!.anhaenge.length }} Anhang{{ selectedItem()!.anhaenge.length !== 1 ? 'e' : '' }}
              </p>
              <div class="space-y-1">
                <button *ngFor="let a of selectedItem()!.anhaenge"
                        (click)="downloadAnhang(a.id, a.dateiname)"
                        class="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-700 truncate">{{ a.dateiname }}</p>
                    <p class="text-[11px] text-gray-400">{{ formatDateigroesse(a.dateigroesse) }}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Compose: Detail area shows preview/help -->
        <div *ngIf="showVerfassen() && !selectedItem()" class="flex-1 flex items-center justify-center">
          <div class="text-center max-w-xs">
            <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <p class="text-sm text-gray-400">Verfassen Sie eine neue Nachricht oder Aufgabe</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class NachrichtencenterComponent implements OnInit {
  private readonly nachrichtService = inject(NachrichtService);
  private readonly userService = inject(UserService);

  // State
  readonly activeOrdner = signal<Ordner>('posteingang');
  readonly activeTypFilter = signal<TypFilter>('alle');
  readonly items = signal<NachrichtItem[]>([]);
  readonly selectedItem = signal<NachrichtItem | null>(null);
  readonly showVerfassen = signal(false);
  readonly ungelesenAnzahl = signal(0);
  readonly allUsers = signal<PortalUser[]>([]);
  readonly selectedEmpfaengerList = signal<PortalUser[]>([]);

  searchQuery = '';
  empfaengerSuche = '';
  showEmpfaengerDropdown = false;
  anhangDateien: File[] = [];

  neueNachricht: {
    typ: NachrichtTyp;
    betreff: string;
    inhalt: string;
    prioritaet: NachrichtPrioritaet;
    frist: string;
    erinnerungAm: string;
  } = {
    typ: 'NACHRICHT',
    betreff: '',
    inhalt: '',
    prioritaet: 'NORMAL',
    frist: '',
    erinnerungAm: ''
  };

  readonly typFilters: { label: string; value: TypFilter; color: string }[] = [
    { label: 'Alle', value: 'alle', color: 'bg-gray-400' },
    { label: 'Nachrichten', value: 'NACHRICHT', color: 'bg-[#006EC7]' },
    { label: 'Aufgaben', value: 'AUFGABE', color: 'bg-amber-500' },
  ];

  readonly selectedEmpfaenger = computed(() => this.selectedEmpfaengerList());

  readonly filteredUsers = computed(() => {
    const q = this.empfaengerSuche.toLowerCase();
    const selectedIds = new Set(this.selectedEmpfaengerList().map(u => u.id));
    return this.allUsers()
      .filter(u => !selectedIds.has(u.id))
      .filter(u => !q || (u.vorname + ' ' + u.nachname).toLowerCase().includes(q))
      .slice(0, 10);
  });

  readonly filteredItems = computed(() => {
    let result = this.items();
    const typFilter = this.activeTypFilter();
    if (typFilter !== 'alle') {
      result = result.filter(i => i.typ === typFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(i =>
        i.betreff.toLowerCase().includes(q) ||
        i.inhalt?.toLowerCase().includes(q) ||
        i.erstellerName.toLowerCase().includes(q)
      );
    }
    return result;
  });

  ngOnInit(): void {
    this.loadItems();
    this.loadUngelesenAnzahl();
    this.userService.getAll().subscribe(users => this.allUsers.set(users));
  }

  setOrdner(ordner: Ordner): void {
    this.activeOrdner.set(ordner);
    this.selectedItem.set(null);
    this.showVerfassen.set(false);
    this.loadItems();
  }

  loadItems(): void {
    const ordner = this.activeOrdner();
    const obs = ordner === 'posteingang' ? this.nachrichtService.getPosteingang()
              : ordner === 'gesendet' ? this.nachrichtService.getGesendet()
              : this.nachrichtService.getArchiv();
    obs.subscribe({
      next: items => this.items.set(items),
      error: () => this.items.set([])
    });
  }

  loadUngelesenAnzahl(): void {
    this.nachrichtService.getUngelesenAnzahl().subscribe({
      next: res => this.ungelesenAnzahl.set(res.anzahl),
      error: () => {}
    });
  }

  selectItem(item: NachrichtItem): void {
    this.selectedItem.set(item);
    if (!item.gelesen && this.activeOrdner() === 'posteingang') {
      this.nachrichtService.alsGelesenMarkieren(item.id).subscribe(() => {
        this.items.update(items =>
          items.map(i => i.id === item.id ? { ...i, gelesen: true } : i)
        );
        this.selectedItem.update(s => s ? { ...s, gelesen: true } : s);
        this.loadUngelesenAnzahl();
      });
    }
  }

  getOrdnerLabel(): string {
    switch (this.activeOrdner()) {
      case 'posteingang': return 'Posteingang';
      case 'gesendet': return 'Gesendet';
      case 'archiv': return 'Archiv';
    }
  }

  // ===== Compose =====

  openVerfassen(): void {
    this.showVerfassen.set(true);
    this.selectedItem.set(null);
    this.resetVerfassen();
  }

  closeVerfassen(): void {
    this.showVerfassen.set(false);
  }

  resetVerfassen(): void {
    this.neueNachricht = {
      typ: 'NACHRICHT', betreff: '', inhalt: '',
      prioritaet: 'NORMAL', frist: '', erinnerungAm: ''
    };
    this.selectedEmpfaengerList.set([]);
    this.empfaengerSuche = '';
    this.anhangDateien = [];
  }

  addEmpfaenger(user: PortalUser): void {
    this.selectedEmpfaengerList.update(list => [...list, user]);
    this.empfaengerSuche = '';
    this.showEmpfaengerDropdown = false;
  }

  removeEmpfaenger(index: number): void {
    this.selectedEmpfaengerList.update(list => list.filter((_, i) => i !== index));
  }

  onDateiAusgewaehlt(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.anhangDateien = [...this.anhangDateien, ...Array.from(input.files)];
    }
    input.value = '';
  }

  canSend(): boolean {
    return this.neueNachricht.betreff.trim().length > 0 &&
           this.selectedEmpfaengerList().length > 0;
  }

  senden(): void {
    if (!this.canSend()) return;
    const data: NachrichtErstellen = {
      typ: this.neueNachricht.typ,
      betreff: this.neueNachricht.betreff,
      inhalt: this.neueNachricht.inhalt,
      prioritaet: this.neueNachricht.prioritaet,
      empfaengerIds: this.selectedEmpfaengerList().map(u => u.id),
      ...(this.neueNachricht.frist ? { frist: this.neueNachricht.frist } : {}),
      ...(this.neueNachricht.erinnerungAm ? { erinnerungAm: this.neueNachricht.erinnerungAm } : {}),
    };

    this.nachrichtService.erstellen(data).subscribe({
      next: (created) => {
        // Upload attachments if any
        if (this.anhangDateien.length > 0) {
          this.anhangDateien.forEach(f => {
            this.nachrichtService.anhangHochladen(created.id, f).subscribe();
          });
        }
        this.closeVerfassen();
        this.setOrdner('gesendet');
      },
      error: () => {}
    });
  }

  // ===== Actions =====

  toggleGelesen(item: NachrichtItem): void {
    const obs = item.gelesen
      ? this.nachrichtService.alsUngelesenMarkieren(item.id)
      : this.nachrichtService.alsGelesenMarkieren(item.id);
    obs.subscribe(() => {
      this.items.update(items =>
        items.map(i => i.id === item.id ? { ...i, gelesen: !item.gelesen } : i)
      );
      this.selectedItem.update(s => s?.id === item.id ? { ...s, gelesen: !item.gelesen } : s);
      this.loadUngelesenAnzahl();
    });
  }

  doArchivieren(item: NachrichtItem): void {
    this.nachrichtService.archivieren(item.id).subscribe(() => {
      this.items.update(items => items.filter(i => i.id !== item.id));
      this.selectedItem.set(null);
      this.loadUngelesenAnzahl();
    });
  }

  doErledigt(item: NachrichtItem): void {
    this.nachrichtService.alsErledigtMarkieren(item.id).subscribe(() => {
      this.items.update(items => items.filter(i => i.id !== item.id));
      this.selectedItem.set(null);
      this.loadUngelesenAnzahl();
    });
  }

  alleAlsGelesen(): void {
    this.nachrichtService.alleAlsGelesenMarkieren().subscribe(() => {
      this.items.update(items => items.map(i => ({ ...i, gelesen: true })));
      this.ungelesenAnzahl.set(0);
    });
  }

  downloadAnhang(anhangId: string, dateiname: string): void {
    this.nachrichtService.anhangHerunterladen(anhangId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dateiname;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // ===== Formatting =====

  formatZeit(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Gerade';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' Min.';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' Std.';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' Tage';
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatZeitVoll(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDatum(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatDateigroesse(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
