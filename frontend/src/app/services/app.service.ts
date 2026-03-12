import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalApp, AppCategory, MarketSegment } from '../models/app.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppService {

  private basePath = `${API_URL}/apps`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PortalApp[]> {
    return this.http.get<PortalApp[]>(this.basePath);
  }

  getById(id: string): Observable<PortalApp> {
    return this.http.get<PortalApp>(`${this.basePath}/${id}`);
  }

  getFeatured(): Observable<PortalApp[]> {
    return this.http.get<PortalApp[]>(`${this.basePath}/featured`);
  }

  getByCategory(category: AppCategory): Observable<PortalApp[]> {
    return this.http.get<PortalApp[]>(`${this.basePath}`, {
      params: { category }
    });
  }

  getByMarketSegment(segment: MarketSegment): Observable<PortalApp[]> {
    return this.http.get<PortalApp[]>(`${this.basePath}`, {
      params: { marketSegment: segment }
    });
  }

  search(query: string): Observable<PortalApp[]> {
    return this.http.get<PortalApp[]>(`${this.basePath}`, {
      params: { q: query }
    });
  }

  create(app: Partial<PortalApp>): Observable<PortalApp> {
    return this.http.post<PortalApp>(this.basePath, app);
  }

  update(id: string, app: Partial<PortalApp>): Observable<PortalApp> {
    return this.http.put<PortalApp>(`${this.basePath}/${id}`, app);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }
}
