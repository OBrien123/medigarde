import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pharmacie, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PharmacieService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/pharmacies`;

  list(params?: Record<string, string>): Observable<PagedResponse<Pharmacie>> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => (p = p.set(k, v)));
    return this.http.get<PagedResponse<Pharmacie>>(`${this.base}/`, { params: p });
  }

  get(id: number): Observable<Pharmacie> {
    return this.http.get<Pharmacie>(`${this.base}/${id}/`);
  }

  // nearest prend lat, lng (pas lon), et med_id (pas medicament)
  nearest(lat: number, lng: number, medId?: number, rayon = 10000): Observable<Pharmacie[]> {
    let p = new HttpParams().set('lat', lat.toString()).set('lng', lng.toString()).set('rayon', rayon.toString());
    if (medId) p = p.set('med_id', medId.toString());
    return this.http.get<Pharmacie[]>(`${this.base}/nearest/`, { params: p });
  }

  // Pour le dashboard pharmacie: la pharmacie liée à l'utilisateur connecté
  // Le PK de Pharmacie = user.id (OneToOneField primary_key=True)
  maPharmacie(userId: number): Observable<Pharmacie> {
    return this.http.get<Pharmacie>(`${this.base}/${userId}/`);
  }

  valider(id: number): Observable<Pharmacie> {
    return this.http.post<Pharmacie>(`${this.base}/${id}/valider/`, {});
  }

  suspendre(id: number): Observable<Pharmacie> {
    return this.http.post<Pharmacie>(`${this.base}/${id}/suspendre/`, {});
  }

  update(id: number, data: Partial<Pharmacie>): Observable<Pharmacie> {
    return this.http.patch<Pharmacie>(`${this.base}/${id}/`, data);
  }
}
