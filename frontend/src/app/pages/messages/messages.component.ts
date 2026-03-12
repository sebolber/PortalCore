import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalMessage } from '../../models/message.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6" style="font-family: 'Fira Sans', sans-serif">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Nachrichten</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ unreadCount() }} ungelesene Nachricht{{ unreadCount() !== 1 ? 'en' : '' }}
          </p>
        </div>
        <button (click)="markAllRead()"
                class="px-4 py-2 text-sm font-medium text-[#006EC7] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          Alle als gelesen markieren
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab.value"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                [ngClass]="activeTab === tab.value
                  ? 'bg-[#006EC7] text-white'
                  : 'text-gray-600 hover:bg-gray-50'">
          {{ tab.label }}
          <span *ngIf="tab.value !== 'alle' && getCountForCategory(tab.value) > 0"
                class="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                [ngClass]="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'">
            {{ getCountForCategory(tab.value) }}
          </span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Nachrichten durchsuchen..."
               [(ngModel)]="searchQuery"
               class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006EC7] focus:border-transparent"/>
      </div>

      <!-- Message Cards -->
      <div class="space-y-3">
        <div *ngFor="let msg of filteredMessages()"
             (click)="toggleRead(msg)"
             class="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 group"
             [ngClass]="msg.read ? 'border-gray-200' : 'border-l-4 border-l-[#006EC7] border-t border-r border-b border-t-gray-200 border-r-gray-200 border-b-gray-200'">
          <div class="flex items-start gap-4">
            <!-- Severity Icon -->
            <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                 [ngClass]="{
                   'bg-blue-50': msg.severity === 'info',
                   'bg-yellow-50': msg.severity === 'warning',
                   'bg-red-50': msg.severity === 'error',
                   'bg-green-50': msg.severity === 'success'
                 }">
              <!-- Info -->
              <svg *ngIf="msg.severity === 'info'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
              </svg>
              <!-- Warning -->
              <svg *ngIf="msg.severity === 'warning'" class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <!-- Error -->
              <svg *ngIf="msg.severity === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <!-- Success -->
              <svg *ngIf="msg.severity === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-sm text-gray-900 truncate"
                      [ngClass]="msg.read ? 'font-medium' : 'font-bold'">
                    {{ msg.title }}
                  </h3>
                  <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ msg.body }}</p>
                </div>
                <!-- Unread Dot -->
                <div *ngIf="!msg.read" class="w-2.5 h-2.5 rounded-full bg-[#006EC7] shrink-0 mt-1.5"></div>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[11px] text-gray-400">{{ msg.timestamp }}</span>
                <span class="text-[11px] text-gray-400">{{ msg.sender }}</span>
                <span class="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full"
                      [ngClass]="{
                        'bg-gray-100 text-gray-600': msg.category === 'system',
                        'bg-purple-100 text-purple-600': msg.category === 'app',
                        'bg-blue-100 text-blue-600': msg.category === 'admin'
                      }">
                  {{ getCategoryLabel(msg.category) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredMessages().length === 0"
             class="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="text-sm text-gray-500">Keine Nachrichten gefunden</p>
        </div>
      </div>

    </div>
  `,
})
export class MessagesComponent {
  searchQuery = '';
  activeTab = 'alle';

  readonly tabs = [
    { label: 'Alle', value: 'alle' },
    { label: 'System', value: 'system' },
    { label: 'App', value: 'app' },
    { label: 'Administration', value: 'admin' },
  ];

  readonly messages = signal<PortalMessage[]>([
    {
      id: 'msg-1',
      title: 'Systemwartung am 15. Maerz geplant',
      body: 'Am 15. Maerz 2026 wird zwischen 02:00 und 04:00 Uhr eine geplante Systemwartung durchgefuehrt. Waehrend dieser Zeit kann es zu kurzen Unterbrechungen kommen.',
      severity: 'info',
      category: 'system',
      sender: 'System',
      timestamp: '2026-03-12 08:00',
      read: false,
    },
    {
      id: 'msg-2',
      title: 'Batch-Job "DTA-Export" fehlgeschlagen',
      body: 'Der Batch-Job "DTA-Export Pruefstelle" ist um 06:12 Uhr mit einem Verbindungsfehler fehlgeschlagen. Bitte ueberpruefen Sie die Netzwerkkonfiguration.',
      severity: 'error',
      category: 'system',
      sender: 'Batch-System',
      timestamp: '2026-03-11 06:15',
      read: false,
    },
    {
      id: 'msg-3',
      title: 'Neue Version von SMILE verfuegbar',
      body: 'SMILE Version 4.2.1 steht zur Installation bereit. Die neue Version enthaelt Fehlerbehebungen und Performance-Verbesserungen.',
      severity: 'info',
      category: 'app',
      sender: 'AppStore',
      timestamp: '2026-03-10 14:30',
      read: false,
    },
    {
      id: 'msg-4',
      title: 'Sicherheitswarnung: Mehrfache Login-Versuche',
      body: 'Es wurden 5 fehlgeschlagene Login-Versuche fuer den Benutzer "m.schmidt" festgestellt. Der Account wurde temporaer gesperrt.',
      severity: 'warning',
      category: 'admin',
      sender: 'Sicherheit',
      timestamp: '2026-03-10 11:20',
      read: true,
    },
    {
      id: 'msg-5',
      title: 'Datenimport erfolgreich abgeschlossen',
      body: 'Der taegliche Datenimport der Leistungserbringerdaten wurde erfolgreich abgeschlossen. 4.320 Datensaetze wurden verarbeitet.',
      severity: 'success',
      category: 'system',
      sender: 'Batch-System',
      timestamp: '2026-03-10 03:15',
      read: true,
    },
    {
      id: 'msg-6',
      title: 'Neuer Mandant "AOK Bayern" angelegt',
      body: 'Der Mandant "AOK Bayern" wurde erfolgreich im System angelegt und konfiguriert. Alle Standard-Apps wurden zugewiesen.',
      severity: 'success',
      category: 'admin',
      sender: 'Admin',
      timestamp: '2026-03-09 16:00',
      read: true,
    },
    {
      id: 'msg-7',
      title: 'SSL-Zertifikat laeuft in 30 Tagen ab',
      body: 'Das SSL-Zertifikat fuer portal.health-portal.de laeuft am 11. April 2026 ab. Bitte erneuern Sie das Zertifikat rechtzeitig.',
      severity: 'warning',
      category: 'system',
      sender: 'Monitoring',
      timestamp: '2026-03-09 09:00',
      read: false,
    },
    {
      id: 'msg-8',
      title: 'KI-Agent "Kodierassistent" deployed',
      body: 'Der KI-Agent "Kodierassistent" wurde erfolgreich in der Produktionsumgebung deployed. Er ist ab sofort verfuegbar.',
      severity: 'info',
      category: 'app',
      sender: 'KI-Plattform',
      timestamp: '2026-03-08 15:45',
      read: true,
    },
  ]);

  readonly unreadCount = computed(() => this.messages().filter(m => !m.read).length);

  readonly filteredMessages = computed(() => {
    let result = this.messages();
    if (this.activeTab !== 'alle') {
      result = result.filter(m => m.category === this.activeTab);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
    }
    return result;
  });

  getCountForCategory(category: string): number {
    return this.messages().filter(m => m.category === category && !m.read).length;
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'system': return 'System';
      case 'app': return 'App';
      case 'admin': return 'Administration';
      default: return category;
    }
  }

  toggleRead(msg: PortalMessage): void {
    this.messages.update(msgs =>
      msgs.map(m => m.id === msg.id ? { ...m, read: !m.read } : m)
    );
  }

  markAllRead(): void {
    this.messages.update(msgs => msgs.map(m => ({ ...m, read: true })));
  }
}
