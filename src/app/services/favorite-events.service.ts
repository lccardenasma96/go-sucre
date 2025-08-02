import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoriteEventsService {
  private apiUrl = `https://api-prueba-oe7m.onrender.com/api/v1/favorite-events`;
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
      error: (error) => {
        console.warn(`Warning: Could not fetch favorite status for event ${eventId}:`, error.status || 'Unknown error');
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

  addFavoriteEvent(event_id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const body = { event_id };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(() => {
        // Actualizar el estado local inmediatamente
        this.favoriteMap.update(map => ({ ...map, [event_id]: true }));
      })
    );
  }

  removeFavoriteEvent(eventId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/${eventId}`, { headers }).pipe(
      tap(() => {
        // Actualizar el estado local inmediatamente
        this.favoriteMap.update(map => {
          const updated = { ...map };
          delete updated[eventId];
          return updated;
        });
      })
    );
  }

  isFavorite(eventId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`https://api-prueba-oe7m.onrender.com/api/v1/favorite-events/${eventId}`, { headers });
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
    console.log('FavoriteEventsService: Refrescando favoritos...');
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
   * Verifica si un evento está en favoritos de forma síncrona
   */
  isFavoriteSync(eventId: number): boolean {
    return this.favoriteMap()[eventId] === true;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
