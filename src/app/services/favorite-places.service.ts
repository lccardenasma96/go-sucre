import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

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
      error: (error) => {
        console.warn(`Warning: Could not fetch favorite status for place ${placeId}:`, error.status || 'Unknown error');
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

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap(favorites => {
        // Actualizar el mapa de favoritos con los datos recibidos
        const newMap: Record<number, boolean> = {};
        favorites.forEach(favorite => {
          newMap[favorite.id] = true;
        });
        this.favoriteMap.set(newMap);
      })
    );
  }

  addFavoritePlace(place_id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const body = { place_id };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(() => {
        // Actualizar el estado local inmediatamente
        this.favoriteMap.update(map => ({ ...map, [place_id]: true }));
      })
    );
  }

  removeFavoritePlace(placeId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/${placeId}`, { headers }).pipe(
      tap(() => {
        // Actualizar el estado local inmediatamente
        this.favoriteMap.update(map => {
          const updated = { ...map };
          delete updated[placeId];
          return updated;
        });
      })
    );
  }

  isFavorite(placeId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`http://localhost:3000/api/v1/favorite-places/${placeId}`, { headers });
  }

  getAllFavorites(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap(favorites => {
        // Actualizar el mapa de favoritos con los datos recibidos
        const newMap: Record<number, boolean> = {};
        favorites.forEach(favorite => {
          newMap[favorite.id] = true;
        });
        this.favoriteMap.set(newMap);
      })
    );
  }

  /**
   * Refresca todos los favoritos desde el servidor
   */
  refreshFavorites(): Observable<any[]> {
    console.log('FavoritePlacesService: Refrescando favoritos...');
    return this.getAllFavorites();
  }

  /**
   * Limpia el estado local de favoritos
   */
  clearFavorites(): void {
    this.favoriteMap.set({});
  }

  /**
   * Obtiene la lista de IDs de favoritos
   */
  getFavoriteIds(): number[] {
    const map = this.favoriteMap();
    return Object.keys(map)
      .filter(key => map[parseInt(key)])
      .map(key => parseInt(key));
  }

  /**
   * Verifica si un lugar está en favoritos de forma síncrona
   */
  isFavoriteSync(placeId: number): boolean {
    return this.favoriteMap()[placeId] === true;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
