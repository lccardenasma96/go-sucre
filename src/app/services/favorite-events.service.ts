// src/app/services/favorite-events.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoriteEventsService {
  private apiUrl = `http://localhost:3000/api/v1/favorite-events`;
  constructor(private http: HttpClient) {}

  private favoriteMap = signal<Record<number, boolean>>({});
  favoriteMapComputed = computed(() => this.favoriteMap());
  isFavoriteSignal(eventId: number): boolean {
    return this.favoriteMap()[eventId] === true;
  }
  fetchFavoriteStatus(eventId: number): void {
    const headers = this.getAuthHeaders();
  
    this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${eventId}`, { headers }).subscribe({
      next: (res) => {
        this.favoriteMap.update(map => ({ ...map, [eventId]: res.isFavorite }));
      },
      error: () => {
        this.favoriteMap.update(map => ({ ...map, [eventId]: false }));
      }
    });
  }
  

  getAllFavoriteEvents(): Observable<{ id: number }[]> {
    return this.http.get<{ id: number }[]>(`${this.apiUrl}/favorite-events`);
  }

 getFavoriteEvents(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }


  addFavoriteEvent(event_id: number): Observable<any> {
    this.favoriteMap.update(map => ({ ...map, [event_id]: true }));
    const token = localStorage.getItem('token'); // o usa tu AuthService si ya lo tienes
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const body = { event_id };
    return this.http.post(this.apiUrl, body, { headers });
  }

  removeFavoriteEvent(eventId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.favoriteMap.update(map => {
      const updated = { ...map };
      delete updated[eventId];
      return updated;
    });
    
    return this.http.delete(`${this.apiUrl}/${eventId}`, { headers });
  }

  isFavorite(eventId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`http://localhost:3000/api/v1/favorite-events/${eventId}`, { headers });
  }

  getAllFavorites(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // o donde almacenes tu JWT
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  }
