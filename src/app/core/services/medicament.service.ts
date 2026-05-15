import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicament, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicamentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/medicaments`;

  list(search = ''): Observable<PagedResponse<Medicament>> {
    let p = new HttpParams().set('page_size', '200');
    if (search) p = p.set('search', search);
    return this.http.get<PagedResponse<Medicament>>(`${this.base}/`, { params: p });
  }
}
