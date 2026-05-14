import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification, Alerte, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/notifications`;

  list(): Observable<PagedResponse<Notification>> {
    return this.http.get<PagedResponse<Notification>>(`${this.base}/`);
  }

  markRead(id: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.base}/${id}/marquer_lu/`, {});
  }

  alertes(): Observable<PagedResponse<Alerte>> {
    return this.http.get<PagedResponse<Alerte>>(`${this.base}/alertes/`);
  }

  createAlerte(data: Partial<Alerte>): Observable<Alerte> {
    return this.http.post<Alerte>(`${this.base}/alertes/`, data);
  }

  toggleAlerte(id: number, active: boolean): Observable<Alerte> {
    return this.http.patch<Alerte>(`${this.base}/alertes/${id}/`, { active });
  }

  deleteAlerte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/alertes/${id}/`);
  }
}
