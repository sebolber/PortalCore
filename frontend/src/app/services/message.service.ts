import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalMessage } from '../models/message.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class MessageService {

  private basePath = `${API_URL}/messages`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PortalMessage[]> {
    return this.http.get<PortalMessage[]>(this.basePath);
  }

  getById(id: string): Observable<PortalMessage> {
    return this.http.get<PortalMessage>(`${this.basePath}/${id}`);
  }

  getByCategory(category: PortalMessage['category']): Observable<PortalMessage[]> {
    return this.http.get<PortalMessage[]>(this.basePath, {
      params: { category }
    });
  }

  getUnread(): Observable<PortalMessage[]> {
    return this.http.get<PortalMessage[]>(`${this.basePath}/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.basePath}/unread/count`);
  }

  markAsRead(id: string): Observable<PortalMessage> {
    return this.http.patch<PortalMessage>(`${this.basePath}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.basePath}/read-all`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }
}
