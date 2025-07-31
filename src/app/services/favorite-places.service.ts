// src/app/services/favorite-places.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritePlacesService {
  private apiUrl = `http://localhost:3000/api/v1/favorite-places`;
  constructor(private http: HttpClient) {}

  private favoriteMap = signal<Record<number, boolean>>({});
  favoriteMapComputed = computed(() => this.favoriteMap());
  isFavoriteSignal(placeId: number): boolean {
    return this.favoriteMap()[placeId] === true;
  }
  fetchFavoriteStatus(placeId: number): void {
    const headers = this.getAuthHeaders();
  
    this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${placeId}`, { headers }).subscribe({
      next: (res) => {
        this.favoriteMap.update(map => ({ ...map, [placeId]: res.isFavorite }));
      },
      error: () => {
        this.favoriteMap.update(map => ({ ...map, [placeId]: false }));
      }
    });
  }
  

  getAllFavoritePlaces(): Observable<{ id: number }[]> {
    return this.http.get<{ id: number }[]>(`${this.apiUrl}/favorite-places`);
  }

 getFavoritePlaces(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }


  addFavoritePlace(place_id: number): Observable<any> {
    this.favoriteMap.update(map => ({ ...map, [place_id]: true }));
    const token = localStorage.getItem('token'); // o usa tu AuthService si ya lo tienes
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const body = { place_id };
    return this.http.post(this.apiUrl, body, { headers });
  }

  removeFavoritePlace(placeId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.favoriteMap.update(map => {
      const updated = { ...map };
      delete updated[placeId];
      return updated;
    });
    
    return this.http.delete(`${this.apiUrl}/${placeId}`, { headers });
  }

  isFavorite(placeId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`http://localhost:3000/api/v1/favorite-places/${placeId}`, { headers });
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
