import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/stocks`;

  list(params?: Record<string, string>): Observable<PagedResponse<Stock>> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => (p = p.set(k, v)));
    return this.http.get<PagedResponse<Stock>>(`${this.base}/`, { params: p });
  }

  create(data: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.base}/`, data);
  }

  update(id: number, data: Partial<Stock>): Observable<Stock> {
    return this.http.patch<Stock>(`${this.base}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }

  byPharmacie(pharmacieId: number): Observable<PagedResponse<Stock>> {
    return this.list({ pharmacie: pharmacieId.toString() });
  }
}
