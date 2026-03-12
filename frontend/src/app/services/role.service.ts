import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalRolle, Berechtigung } from '../models/user.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoleService {

  private rolesPath = `${API_URL}/roles`;
  private permissionsPath = `${API_URL}/permissions`;

  constructor(private http: HttpClient) {}

  // Roles
  getAllRoles(): Observable<PortalRolle[]> {
    return this.http.get<PortalRolle[]>(this.rolesPath);
  }

  getRoleById(id: string): Observable<PortalRolle> {
    return this.http.get<PortalRolle>(`${this.rolesPath}/${id}`);
  }

  createRole(role: Partial<PortalRolle>): Observable<PortalRolle> {
    return this.http.post<PortalRolle>(this.rolesPath, role);
  }

  updateRole(id: string, role: Partial<PortalRolle>): Observable<PortalRolle> {
    return this.http.put<PortalRolle>(`${this.rolesPath}/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesPath}/${id}`);
  }

  assignPermissions(roleId: string, berechtigungIds: string[]): Observable<PortalRolle> {
    return this.http.patch<PortalRolle>(`${this.rolesPath}/${roleId}/permissions`, { berechtigungIds });
  }

  // Permissions
  getAllPermissions(): Observable<Berechtigung[]> {
    return this.http.get<Berechtigung[]>(this.permissionsPath);
  }

  getPermissionById(id: string): Observable<Berechtigung> {
    return this.http.get<Berechtigung>(`${this.permissionsPath}/${id}`);
  }

  getPermissionsByApp(appId: string): Observable<Berechtigung[]> {
    return this.http.get<Berechtigung[]>(this.permissionsPath, {
      params: { appId }
    });
  }

  getPermissionsByRole(roleId: string): Observable<Berechtigung[]> {
    return this.http.get<Berechtigung[]>(`${this.rolesPath}/${roleId}/permissions`);
  }
}
