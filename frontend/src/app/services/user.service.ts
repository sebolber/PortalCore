import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalUser } from '../models/user.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {

  private basePath = `${API_URL}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PortalUser[]> {
    return this.http.get<PortalUser[]>(this.basePath);
  }

  getById(id: string): Observable<PortalUser> {
    return this.http.get<PortalUser>(`${this.basePath}/${id}`);
  }

  getByTenant(tenantId: string): Observable<PortalUser[]> {
    return this.http.get<PortalUser[]>(this.basePath, {
      params: { tenantId }
    });
  }

  create(user: Partial<PortalUser>): Observable<PortalUser> {
    return this.http.post<PortalUser>(this.basePath, user);
  }

  update(id: string, user: Partial<PortalUser>): Observable<PortalUser> {
    return this.http.put<PortalUser>(`${this.basePath}/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }

  updateStatus(id: string, status: PortalUser['status']): Observable<PortalUser> {
    return this.http.patch<PortalUser>(`${this.basePath}/${id}/status`, { status });
  }

  assignRoles(id: string, rollenIds: string[]): Observable<PortalUser> {
    return this.http.patch<PortalUser>(`${this.basePath}/${id}/roles`, { rollenIds });
  }
}
