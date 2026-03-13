import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NachrichtItem, NachrichtErstellen, NachrichtAnhang, NachrichtTyp } from '../models/nachricht.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class NachrichtService {

  private basePath = `${API_URL}/nachricht`;

  constructor(private http: HttpClient) {}

  getPosteingang(typ?: NachrichtTyp): Observable<NachrichtItem[]> {
    const params: Record<string, string> = {};
    if (typ) params['typ'] = typ;
    return this.http.get<NachrichtItem[]>(`${this.basePath}/posteingang`, { params });
  }

  getGesendet(): Observable<NachrichtItem[]> {
    return this.http.get<NachrichtItem[]>(`${this.basePath}/gesendet`);
  }

  getArchiv(): Observable<NachrichtItem[]> {
    return this.http.get<NachrichtItem[]>(`${this.basePath}/archiv`);
  }

  getUngelesenAnzahl(): Observable<{ anzahl: number }> {
    return this.http.get<{ anzahl: number }>(`${this.basePath}/ungelesen-anzahl`);
  }

  getById(id: string): Observable<NachrichtItem> {
    return this.http.get<NachrichtItem>(`${this.basePath}/${id}`);
  }

  erstellen(data: NachrichtErstellen): Observable<NachrichtItem> {
    return this.http.post<NachrichtItem>(this.basePath, data);
  }

  alsGelesenMarkieren(id: string): Observable<void> {
    return this.http.put<void>(`${this.basePath}/${id}/gelesen`, {});
  }

  alsUngelesenMarkieren(id: string): Observable<void> {
    return this.http.put<void>(`${this.basePath}/${id}/ungelesen`, {});
  }

  archivieren(id: string): Observable<void> {
    return this.http.put<void>(`${this.basePath}/${id}/archivieren`, {});
  }

  alsErledigtMarkieren(id: string): Observable<void> {
    return this.http.put<void>(`${this.basePath}/${id}/erledigt`, {});
  }

  alleAlsGelesenMarkieren(): Observable<{ markiert: number }> {
    return this.http.put<{ markiert: number }>(`${this.basePath}/alle-gelesen`, {});
  }

  anhangHochladen(nachrichtId: string, datei: File): Observable<NachrichtAnhang> {
    const formData = new FormData();
    formData.append('datei', datei);
    return this.http.post<NachrichtAnhang>(`${this.basePath}/${nachrichtId}/anhaenge`, formData);
  }

  anhangHerunterladen(anhangId: string): Observable<Blob> {
    return this.http.get(`${this.basePath}/anhaenge/${anhangId}`, { responseType: 'blob' });
  }
}
