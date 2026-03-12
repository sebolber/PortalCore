import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstalledApp } from '../models/app.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class InstalledAppService {

  constructor(private http: HttpClient) {}

  private basePath(tenantId: string): string {
    return `${API_URL}/tenants/${tenantId}/installed-apps`;
  }

  getAll(tenantId: string): Observable<InstalledApp[]> {
    return this.http.get<InstalledApp[]>(this.basePath(tenantId));
  }

  getById(tenantId: string, id: string): Observable<InstalledApp> {
    return this.http.get<InstalledApp>(`${this.basePath(tenantId)}/${id}`);
  }

  install(tenantId: string, appId: string): Observable<InstalledApp> {
    return this.http.post<InstalledApp>(this.basePath(tenantId), { appId });
  }

  uninstall(tenantId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath(tenantId)}/${id}`);
  }
}
