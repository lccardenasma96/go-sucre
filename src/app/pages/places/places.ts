import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectorRef
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';

import { MunicipioService } from '../../services/municipio';
import { ApiService } from '../../services/api.service';

import { Maps } from '../../components/maps/maps';
import { SliderComponent } from '../../components/slider/slider.component';
import { FavoriteEventsService } from '../../services/favorite-events.service';
import { FavoritePlacesService } from '../../services/favorite-places.service';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [Maps, SliderComponent, NgIf, MatTabsModule, MatIcon],
  templateUrl: './places.html',
  styleUrl: './places.css'
})
export class Places implements OnInit {
  @ViewChild('infoDialog') infoDialog!: ElementRef<HTMLDialogElement>;

  isMobile: boolean = false;

  // Signals
  eventos = signal<any[]>([]);
  groupedPlaces = signal<Record<number, any[]>>({});
  favoriteEvents = signal<number[]>([]);
  favoritePlaces = signal<number[]>([]);

  // Servicios
  municipioService = inject(MunicipioService);
  apiService = inject(ApiService);
  favoriteEventsService = inject(FavoriteEventsService);

  favoritePlacesService = inject(FavoritePlacesService);

  private cdr = inject(ChangeDetectorRef);
  // Municipio seleccionado
  selectedMunicipio = this.municipioService.selectedMunicipioSignal;

  // Signal derivada: solo los lugares del municipio actual
  lugares = computed(() => {
    const municipio = this.selectedMunicipio();
    const allGrouped = this.groupedPlaces();
    return municipio?.id ? allGrouped[municipio.id] || [] : [];
  });

  constructor() {
    console.log('Places component constructor called');
    console.log('User logged in:', this.apiService.isLoggedIn());
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('toggleFavoriteEvent method exists:', typeof this.toggleFavoriteEvent);
    this.loadPlaces();
    this.loadFavorites();

    // Cargar eventos según el municipio seleccionado
    effect(() => {
      const municipio = this.selectedMunicipio();
      if (municipio?.id) {
        this.apiService.getEventsByMunicipio(municipio.id).subscribe(data => {
          this.eventos.set(data);
        });
      } else {
        this.eventos.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  onMunicipioSeleccionado(): void {
    if (this.isMobile && this.infoDialog?.nativeElement) {
      setTimeout(() => {
        this.infoDialog.nativeElement.showModal();
      }, 0);
    }
  }

  closeDialog(): void {
    this.infoDialog?.nativeElement?.close();
  }

  // ---------- MÉTODOS AUXILIARES ----------

  private loadPlaces() {
    this.apiService.getAllPlaces().subscribe(data => {
      const agrupados: Record<number, any[]> = {};
      data.forEach(place => {
        const id = place.municipio_id;
        if (!agrupados[id]) agrupados[id] = [];
        agrupados[id].push(place);
      });
      this.groupedPlaces.set(agrupados);
    });
  }

  private loadFavorites() {
    if (!this.apiService.isLoggedIn()) {
      console.log('User not logged in, skipping favorites load');
      return;
    }

    this.apiService.getFavoritePlaces().subscribe({
      next: (data) => {
        const ids = data.map(p => p.id);
        this.favoritePlaces.set(ids);
      },
      error: (err) => {
        console.error('Error loading favorite places:', err);
      }
    });

    this.favoriteEventsService.getFavoriteEvents().subscribe({
      next: (data) => {
        const ids = data.map(e => e.id);
        this.favoriteEvents.set(ids);
      },
      error: (err) => {
        console.error('Error loading favorite events:', err);
      }
    });
  }

  // ---------- FAVORITOS: PLACES ----------

  toggleFavoritePlace(placeId: number) {
    console.log('Places: toggleFavoriteEvent called with eventId:', placeId);
    if (!this.apiService.isLoggedIn()) {
      console.log('User not logged in, cannot toggle favorite');
      return;
    }
  
  }

  // ---------- FAVORITOS: EVENTS ----------

  toggleFavoriteEvent(eventId: number) {
    console.log('Places: toggleFavoriteEvent called with eventId:', eventId);
    if (!this.apiService.isLoggedIn()) {
      console.log('User not logged in, cannot toggle favorite');
      return;
    }
    if (this.favoriteEventsService.isFavoriteSignal(eventId)) {
      this.favoriteEventsService.removeFavoriteEvent(eventId).subscribe();
    } else {
      this.favoriteEventsService.addFavoriteEvent(eventId).subscribe();
    }
  } 
  
}
