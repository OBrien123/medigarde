import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pharmacie, Recherche, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

export interface RechercheResultat {
  pharmacie: Pharmacie;
  distance?: number;
}

@Injectable({ providedIn: 'root' })
export class RechercheService {
  private http = inject(HttpClient);
  private basePharm = `${environment.apiUrl}/api/pharmacies`;
  private baseMed   = `${environment.apiUrl}/api/medicaments`;
  private baseHist  = `${environment.apiUrl}/api/recherches`;

  // Recherche : d'abord on cherche le médicament par nom, puis nearest
  chercherMedicament(nom: string): Observable<PagedResponse<{id: number; nom_generique: string}>> {
    const p = new HttpParams().set('search', nom);
    return this.http.get<PagedResponse<{id: number; nom_generique: string}>>(`${this.baseMed}/`, { params: p });
  }

  chercherPharmaciesProches(lat: number, lng: number, medId?: number, rayon = 10000): Observable<Pharmacie[]> {
    let p = new HttpParams().set('lat', lat.toString()).set('lng', lng.toString()).set('rayon', rayon.toString());
    if (medId) p = p.set('med_id', medId.toString());
    return this.http.get<Pharmacie[]>(`${this.basePharm}/nearest/`, { params: p });
  }

  historique(): Observable<PagedResponse<Recherche>> {
    return this.http.get<PagedResponse<Recherche>>(`${this.baseHist}/history/`);
  }
}
