import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'erstellt' | 'geaendert' | 'geloescht' | 'login' | 'gesperrt' | 'entsperrt';
  beschreibung: string;
  benutzer: string;
  ausgefuehrtVon: string;
}

@Component({
  selector: 'app-audit-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `,
})
export class AuditTabComponent {
  @Input() auditTrail: AuditEntry[] = [];

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
