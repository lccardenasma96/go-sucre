import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FavoriteEventsService } from '../../services/favorite-events.service';
import { FavoritePlacesService } from '../../services/favorite-places.service';
import { AuthService } from '../../services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, MatIcon, MatTabsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  favoriteEventsService = inject(FavoriteEventsService);
  favoritePlacesService = inject(FavoritePlacesService);

  // Datos completos
  favoriteEventsData = signal<any[]>([]);
  favoritePlacesData = signal<any[]>([]);

  // Estado actual de la pestaña
  selectedTab = 0;
  tabs = [
    { label: 'Favoritos' },
    { label: 'Sitios visitados' },
    { label: 'Calendario' },
  ];

  // Obtener nombre de usuario del token
  userName = this.getUserNameFromToken() || 'Usuario';

  ngOnInit(): void {
    this.loadFavorites();
  }

  private getUserNameFromToken(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.name || null;
    } catch (e) {
      return null;
    }
  }

  private loadFavorites(): void {
    if (!this.auth.isAuthenticated()) return;

    this.favoriteEventsService.getFavoriteEvents().subscribe({
      next: (data) => this.favoriteEventsData.set(data),
      error: (err) => console.error('Error loading favorite events:', err),
    });

    this.favoritePlacesService.getFavoritePlaces().subscribe({
      next: (data) => this.favoritePlacesData.set(data),
      error: (err) => console.error('Error loading favorite places:', err),
    });
  }

  // Mapea favoritos por ID usando el servicio
  favoriteMap = computed(() => {
    return this.favoriteEventsService.favoriteMapComputed();
  });

  //  Método usado en HTML
  onToggleFavorite(eventId: number): void {
    if (!this.auth.isAuthenticated()) return;

    const isFavorite = this.favoriteMap()[eventId];
    
    if (isFavorite) {
      this.favoriteEventsService.removeFavoriteEvent(eventId).subscribe({
        next: () => {
          console.log('Evento removido de favoritos');
          this.removeEventFromView(eventId);
        },
        error: (error) => {
          console.error('Error al remover de favoritos:', error);
        }
      });
    } else {
      this.favoriteEventsService.addFavoriteEvent(eventId).subscribe({
        next: () => {
          console.log('Evento agregado a favoritos');
        },
        error: (error) => {
          console.error('Error al agregar a favoritos:', error);
        }
      });
    }
  }

  toggleFavoritePlace(placeId: number): void {
    if (!this.auth.isAuthenticated()) return;

    const isFavorite = this.favoritePlacesService.isFavoriteSignal(placeId);
    
    if (isFavorite) {
      this.favoritePlacesService.removeFavoritePlace(placeId).subscribe({
        next: () => {
          console.log('Lugar removido de favoritos');
          this.removePlaceFromView(placeId);
        },
        error: (error) => {
          console.error('Error al remover lugar de favoritos:', error);
        }
      });
    } else {
      this.favoritePlacesService.addFavoritePlace(placeId).subscribe({
        next: () => {
          console.log('Lugar agregado a favoritos');
        },
        error: (error) => {
          console.error('Error al agregar lugar a favoritos:', error);
        }
      });
    }
  }

  private removeEventFromView(id: number) {
    this.favoriteEventsData.update(events => events.filter(e => e.id !== id));
  }

  private removePlaceFromView(id: number) {
    this.favoritePlacesData.update(places => places.filter(p => p.id !== id));
  }

  selectTab(index: number) {
    this.selectedTab = index;
  }

  logout() {
    this.auth.logout();
    window.location.reload();
  }
}
