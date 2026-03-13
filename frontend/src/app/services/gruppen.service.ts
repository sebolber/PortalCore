import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.service';
import { Gruppe, GruppenBerechtigung } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class GruppenService {

  constructor(private http: HttpClient) {}

  getAll(tenantId?: string): Observable<Gruppe[]> {
    const params = tenantId ? { tenantId } : {};
    return this.http.get<Gruppe[]>(`${API_URL}/gruppen`, { params });
  }

  getById(id: string): Observable<Gruppe> {
    return this.http.get<Gruppe>(`${API_URL}/gruppen/${id}`);
  }

  create(gruppe: Partial<Gruppe>): Observable<Gruppe> {
    return this.http.post<Gruppe>(`${API_URL}/gruppen`, gruppe);
  }

  update(id: string, gruppe: Partial<Gruppe>): Observable<Gruppe> {
    return this.http.put<Gruppe>(`${API_URL}/gruppen/${id}`, gruppe);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/gruppen/${id}`);
  }

  // Berechtigungen
  getBerechtigungen(gruppeId: string): Observable<GruppenBerechtigung[]> {
    return this.http.get<GruppenBerechtigung[]>(`${API_URL}/gruppen/${gruppeId}/berechtigungen`);
  }

  addBerechtigung(gruppeId: string, b: Partial<GruppenBerechtigung>): Observable<GruppenBerechtigung> {
    return this.http.post<GruppenBerechtigung>(`${API_URL}/gruppen/${gruppeId}/berechtigungen`, b);
  }

  updateBerechtigung(gruppeId: string, bId: string, b: Partial<GruppenBerechtigung>): Observable<GruppenBerechtigung> {
    return this.http.put<GruppenBerechtigung>(`${API_URL}/gruppen/${gruppeId}/berechtigungen/${bId}`, b);
  }

  deleteBerechtigung(gruppeId: string, bId: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/gruppen/${gruppeId}/berechtigungen/${bId}`);
  }

  // Benutzer
  addUser(gruppeId: string, userId: string): Observable<any> {
    return this.http.post(`${API_URL}/gruppen/${gruppeId}/benutzer/${userId}`, {});
  }

  removeUser(gruppeId: string, userId: string): Observable<any> {
    return this.http.delete(`${API_URL}/gruppen/${gruppeId}/benutzer/${userId}`);
  }
}
