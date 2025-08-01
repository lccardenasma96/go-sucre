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
import { MatTabChangeEvent } from '@angular/material/tabs';

import { MunicipioService } from '../../services/municipio';
import { ApiService } from '../../services/api.service';

import { Maps } from '../../components/maps/maps';
import { SliderComponent } from '../../components/slider/slider.component';
import { FavoriteEventsService } from '../../services/favorite-events.service';
import { FavoritePlacesService } from '../../services/favorite-places.service';
import { TabService } from '../../services/tab.service';

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

  constructor(public tabService: TabService) {
    console.log('Places component constructor called');
    console.log('User logged in:', this.apiService.isLoggedIn());
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('toggleFavoriteEvent method exists:', typeof this.toggleFavoriteEvent);
    console.log('toggleFavoritePlace method exists:', typeof this.toggleFavoritePlace);

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

    // Observar cambios en los favoritos de eventos
    effect(() => {
      const favoriteMap = this.favoriteEventsService.favoriteMapComputed();
      const favoriteIds = Object.keys(favoriteMap)
        .filter(key => favoriteMap[parseInt(key)])
        .map(key => parseInt(key));
      this.favoriteEvents.set(favoriteIds);
    });

    // Observar cambios en los favoritos de lugares
    effect(() => {
      const favoriteMap = this.favoritePlacesService.favoriteMapComputed();
      const favoriteIds = Object.keys(favoriteMap)
        .filter(key => favoriteMap[parseInt(key)])
        .map(key => parseInt(key));
      this.favoritePlaces.set(favoriteIds);
    });
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  cambiarTab(event: MatTabChangeEvent) {
    this.tabService.currentTab.set(event.index);
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

    // Cargar favoritos de lugares
    this.favoritePlacesService.getAllFavorites().subscribe({
      next: (data) => {
        console.log('Favoritos de lugares cargados en Places:', data);
        const ids = data.map(p => p.id);
        this.favoritePlaces.set(ids);
      },
      error: (err) => {
        console.error('Error loading favorite places:', err);
      }
    });

    // Cargar favoritos de eventos
    this.favoriteEventsService.getAllFavorites().subscribe({
      next: (data) => {
        console.log('Favoritos de eventos cargados en Places:', data);
        const ids = data.map(e => e.id);
        this.favoriteEvents.set(ids);
      },
      error: (err) => {
        console.error('Error loading favorite events:', err);
      }
    });
  }

  // ---------- FAVORITOS: PLACES ----------

  toggleFavoritePlace(placeId: number): void {
    console.log('Places: toggleFavoritePlace called with placeId:', placeId);
    if (!this.apiService.isLoggedIn()) {
      console.log('User not logged in, cannot toggle favorite');
      return;
    }
    console.log('Toggle favorito para el lugar:', placeId);

    if (this.favoritePlacesService.isFavoriteSignal(placeId)) {
      this.favoritePlacesService.removeFavoritePlace(placeId).subscribe({
        next: () => {
          console.log('Lugar removido de favoritos:', placeId);
        },
        error: (error) => {
          console.error('Error removiendo lugar de favoritos:', error);
        }
      });
    } else {
      this.favoritePlacesService.addFavoritePlace(placeId).subscribe({
        next: () => {
          console.log('Lugar agregado a favoritos:', placeId);
        },
        error: (error) => {
          console.error('Error agregando lugar a favoritos:', error);
        }
      });
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
      this.favoriteEventsService.removeFavoriteEvent(eventId).subscribe({
        next: () => {
          console.log('Evento removido de favoritos:', eventId);
        },
        error: (error) => {
          console.error('Error removiendo evento de favoritos:', error);
        }
      });
    } else {
      this.favoriteEventsService.addFavoriteEvent(eventId).subscribe({
        next: () => {
          console.log('Evento agregado a favoritos:', eventId);
        },
        error: (error) => {
          console.error('Error agregando evento a favoritos:', error);
        }
      });
    }
  }

}
