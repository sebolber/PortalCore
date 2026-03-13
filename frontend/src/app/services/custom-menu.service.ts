import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.service';

export interface CustomMenuItem {
  id: string;
  tenantId: string;
  parentId: string | null;
  label: string;
  icon: string;
  menuType: string; // IFRAME, LINK, SEPARATOR
  url: string | null;
  sortOrder: number;
  visible: boolean;
  erstelltAm: string | null;
  erstelltVon: string | null;
}

export interface MenuOrderConfig {
  id: string;
  tenantId: string;
  menuItemKey: string;
  sortOrder: number;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class CustomMenuService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: string): Observable<CustomMenuItem[]> {
    return this.http.get<CustomMenuItem[]>(`${API_URL}/custom-menu-items`, { params: { tenantId } });
  }

  getTopLevel(tenantId: string): Observable<CustomMenuItem[]> {
    return this.http.get<CustomMenuItem[]>(`${API_URL}/custom-menu-items/top-level`, { params: { tenantId } });
  }

  create(item: Partial<CustomMenuItem>): Observable<CustomMenuItem> {
    return this.http.post<CustomMenuItem>(`${API_URL}/custom-menu-items`, item);
  }

  update(id: string, item: Partial<CustomMenuItem>): Observable<CustomMenuItem> {
    return this.http.put<CustomMenuItem>(`${API_URL}/custom-menu-items/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/custom-menu-items/${id}`);
  }

  reorder(items: { id: string }[]): Observable<void> {
    return this.http.put<void>(`${API_URL}/custom-menu-items/reorder`, items);
  }

  // Menu Order Config
  getMenuOrder(tenantId: string): Observable<MenuOrderConfig[]> {
    return this.http.get<MenuOrderConfig[]>(`${API_URL}/menu-order`, { params: { tenantId } });
  }

  saveMenuOrder(tenantId: string, configs: MenuOrderConfig[]): Observable<MenuOrderConfig[]> {
    return this.http.put<MenuOrderConfig[]>(`${API_URL}/menu-order`, configs, { params: { tenantId } });
  }
}
