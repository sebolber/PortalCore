import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalParameter, ParameterAuditLog } from '../models/parameter.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class ParameterService {

  private basePath = `${API_URL}/parameters`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PortalParameter[]> {
    return this.http.get<PortalParameter[]>(this.basePath);
  }

  getById(id: string): Observable<PortalParameter> {
    return this.http.get<PortalParameter>(`${this.basePath}/${id}`);
  }

  getByApp(appId: string): Observable<PortalParameter[]> {
    return this.http.get<PortalParameter[]>(this.basePath, {
      params: { appId }
    });
  }

  create(parameter: Partial<PortalParameter>): Observable<PortalParameter> {
    return this.http.post<PortalParameter>(this.basePath, parameter);
  }

  update(id: string, parameter: Partial<PortalParameter>): Observable<PortalParameter> {
    return this.http.put<PortalParameter>(`${this.basePath}/${id}`, parameter);
  }

  updateValue(id: string, value: string, grund?: string): Observable<PortalParameter> {
    return this.http.patch<PortalParameter>(`${this.basePath}/${id}/value`, { value, grund: grund || '' });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }

  resetToDefault(id: string): Observable<PortalParameter> {
    return this.http.patch<PortalParameter>(`${this.basePath}/${id}/reset`, {});
  }

  getAuditLog(appId?: string, parameterId?: string): Observable<ParameterAuditLog[]> {
    let params = new HttpParams();
    if (appId) params = params.set('appId', appId);
    if (parameterId) params = params.set('parameterId', parameterId);
    return this.http.get<ParameterAuditLog[]>(`${this.basePath}/audit-log`, { params });
  }
}
