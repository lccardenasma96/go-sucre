import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private API_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // --- LOGIN ---
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, { email, password });
  }

  // --- REGISTER ---
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/`, { name, email, password });
  }

  // --- EVENTS ---
  getEventsByMunicipio(municipio_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/municipios/${municipio_id}/events`);
  }

  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/events`);
  }

  // --- PLACES ---
  getAllPlaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/places`);
  }

  // --- FAVORITOS ---
  // --- Lugares favoritos ---
  getFavoritePlaces(): Observable<any[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<any[]>(`${this.API_URL}/favorite-places`, { headers });
  }

  addFavoritePlace(place_id: number): Observable<any> {
    const headers = this.createAuthHeaders(true);
    return this.http.post(`${this.API_URL}/favorite-places`, { place_id }, { headers });
  }

  removeFavoritePlace(place_id: number): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.delete(`${this.API_URL}/favorite-places/${place_id}`, { headers });
  }

  // --- Eventos favoritos ---
  getFavoriteEvents(): Observable<any[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<any[]>(`${this.API_URL}/favorite-events`, { headers });
  }

  addFavoriteEvent(event_id: number): Observable<any> {
    const headers = this.createAuthHeaders(true);
    return this.http.post(`${this.API_URL}/favorite-events`, { event_id }, { headers });
  }

  removeFavoriteEvent(event_id: number): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.delete(`${this.API_URL}/favorite-events/${event_id}`, { headers });
  }

  // --- UTILITARIOS ---
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private createAuthHeaders(isJson = false): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
}
