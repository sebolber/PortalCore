import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(protected http: HttpClient) {}

  protected get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${API_URL}${path}`, { params });
  }

  protected post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body);
  }

  protected put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${API_URL}${path}`, body);
  }

  protected patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${API_URL}${path}`, body);
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`);
  }
}
