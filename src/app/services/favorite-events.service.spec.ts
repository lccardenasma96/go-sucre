import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteEventsService {
  private API = 'http://localhost:3000/api/v1/favorite-events';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getFavorites(): Observable<any> {
    return this.http.get(this.API, {
      headers: this.getAuthHeaders()
    });
  }

  addFavorite(event_id: number): Observable<any> {
    return this.http.post(this.API, { event_id }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteFavorite(event_id: number): Observable<any> {
    return this.http.delete(`${this.API}/${event_id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
