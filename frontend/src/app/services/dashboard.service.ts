import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetDefinition, DashboardWidget, PortalSeite } from '../models/dashboard.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private basePath = `${API_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  getWidgetDefinitionen(kategorie?: string): Observable<WidgetDefinition[]> {
    const params: Record<string, string> = {};
    if (kategorie) params['kategorie'] = kategorie;
    return this.http.get<WidgetDefinition[]>(`${this.basePath}/widget-definitionen`, { params });
  }

  getUserWidgets(): Observable<DashboardWidget[]> {
    return this.http.get<DashboardWidget[]>(`${this.basePath}/widgets`);
  }

  widgetHinzufuegen(data: {
    widgetDefinitionId: string;
    positionX: number;
    positionY: number;
    breite: number;
    hoehe: number;
    konfiguration?: string;
  }): Observable<DashboardWidget> {
    return this.http.post<DashboardWidget>(`${this.basePath}/widgets`, data);
  }

  widgetAktualisieren(id: string, data: {
    positionX: number;
    positionY: number;
    breite: number;
    hoehe: number;
    konfiguration?: string;
  }): Observable<DashboardWidget> {
    return this.http.put<DashboardWidget>(`${this.basePath}/widgets/${id}`, data);
  }

  widgetEntfernen(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/widgets/${id}`);
  }

  layoutSpeichern(items: { id: string; positionX: number; positionY: number; breite: number; hoehe: number; sortierung: number }[]): Observable<void> {
    return this.http.put<void>(`${this.basePath}/layout`, items);
  }

  getSeiten(): Observable<PortalSeite[]> {
    return this.http.get<PortalSeite[]>(`${this.basePath}/seiten`);
  }
}
