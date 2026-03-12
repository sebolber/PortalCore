import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BatchJob } from '../models/batch-job.model';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class BatchJobService {

  private basePath = `${API_URL}/batch-jobs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BatchJob[]> {
    return this.http.get<BatchJob[]>(this.basePath);
  }

  getById(id: string): Observable<BatchJob> {
    return this.http.get<BatchJob>(`${this.basePath}/${id}`);
  }

  getByProdukt(produktId: string): Observable<BatchJob[]> {
    return this.http.get<BatchJob[]>(this.basePath, {
      params: { produktId }
    });
  }

  create(job: Partial<BatchJob>): Observable<BatchJob> {
    return this.http.post<BatchJob>(this.basePath, job);
  }

  update(id: string, job: Partial<BatchJob>): Observable<BatchJob> {
    return this.http.put<BatchJob>(`${this.basePath}/${id}`, job);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }

  start(id: string): Observable<BatchJob> {
    return this.http.post<BatchJob>(`${this.basePath}/${id}/start`, {});
  }

  pause(id: string): Observable<BatchJob> {
    return this.http.post<BatchJob>(`${this.basePath}/${id}/pause`, {});
  }

  stop(id: string): Observable<BatchJob> {
    return this.http.post<BatchJob>(`${this.basePath}/${id}/stop`, {});
  }

  restart(id: string): Observable<BatchJob> {
    return this.http.post<BatchJob>(`${this.basePath}/${id}/restart`, {});
  }
}
