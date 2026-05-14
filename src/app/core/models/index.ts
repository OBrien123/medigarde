export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'client' | 'pharmacie' | 'admin';
  telephone?: string;
}

export interface Client {
  user: number;
  adresse?: string;
  ville?: string;
  latitude?: number;
  longitude?: number;
}

export interface Pharmacie {
  user_id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  statut: 'en_attente' | 'valide' | 'suspendu';
  horaires?: Horaire[];
  stocks?: Stock[];
  rating?: number;
  nombre_avis?: number;
  distance?: number;
}

export interface Medicament {
  id: number;
  nom_generique: string;
  nom_commercial?: string;
  forme: string;
  dosage: string;
  prescription: boolean;
  categorie_nom?: string;
}

export interface MedicamentDetail {
  id: number;
  nom_generique: string;
  nom_commercial?: string;
  forme_display?: string;
  dosage: string;
  prescription: boolean;
}

export interface Stock {
  id: number;
  medicament: number;
  medicament_detail?: MedicamentDetail;
  pharmacie: number;
  quantite: number;
  prix: number;
  disponible: boolean;
  seuil_alerte: number;
  est_stock_faible?: boolean;
  date_mise_a_jour?: string;
}

export interface RechercheResult {
  pharmacie: Pharmacie;
  stocks: Stock[];
  distance?: number;
}

export interface Horaire {
  id: number;
  jour: string;
  heure_ouverture: string;
  heure_fermeture: string;
  ferme: boolean;
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  type: 'info' | 'alerte' | 'stock' | 'systeme';
}

export interface Alerte {
  id: number;
  medicament: number;
  medicament_nom?: string;
  rayon: number;
  active: boolean;
  date_notification?: string;
  pharmacie?: number;
}

export interface Recherche {
  id: number;
  medicament_nom: string;
  date: string;
  latitude?: number;
  longitude?: number;
  resultats_count?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PagedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
