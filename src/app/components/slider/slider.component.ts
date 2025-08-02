import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  inject,
  signal,
  effect,
  computed
} from '@angular/core';

import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { FavoriteEventsService } from '../../services/favorite-events.service';
import { TabService } from '../../services/tab.service';
import { FavoritePlacesService } from '../../services/favorite-places.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [NgIf, NgFor, MatIcon, CommonModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() items: any[] = [];
  @Input() title: string = '';
  @Input() favorites: number[] = [];

  @Output() toggleFavoriteEvent = new EventEmitter<number>();
  @Output() toggleFavoritePlace = new EventEmitter<number>();
  @Input() isEvent: boolean = false;
  @Input() event: any;

  @ViewChild('viewport', { static: false }) viewportRef!: ElementRef;
  embla: EmblaCarouselType | null = null;
  favoriteEventsService = inject(FavoriteEventsService)
  favoritePlacesService = inject(FavoritePlacesService)
  private tabService = inject(TabService);

  constructor(private cdr: ChangeDetectorRef) {
    console.log('Slider: constructor called, toggleFavoriteEvent output exists:', !!this.toggleFavoriteEvent);

    effect(() => {
      console.log('Tab cambió a:', this.tabService.currentTab());
      this.refreshFavorites();
    });
  }

  ngOnInit(): void {
    console.log('Slider: ngOnInit called with items:', this.items?.length);
    if (!this.items) {
      this.items = [];
    }

    // Cargar todos los favoritos al inicializar
    this.loadAllFavorites();

    // Debug: mostrar estado del map después de cargar
    setTimeout(() => {
      this.debugFavoriteMap();
    }, 1000);
  }

  readonly favoriteMap = computed(() =>
    this.tabService.currentTab() === 0
      ? this.favoriteEventsService.favoriteMapComputed()
      : this.favoritePlacesService.favoriteMapComputed()
  );

  /*
   * Crea un map específico para los eventos del array
   */
  readonly eventsFavoriteMap = computed(() => {
    if (!this.items || this.items.length === 0) return {};

    const map: Record<number, boolean> = {};
    const currentFavorites = this.favoriteMap();

    console.log('🔍 Creando eventsFavoriteMap...');
    console.log('📋 Items disponibles:', this.items.map(item => ({ id: item.id, name: item.name })));
    console.log('❤️ Favoritos actuales:', currentFavorites);

    this.items.forEach(item => {
      map[item.id] = currentFavorites[item.id] === true;
      console.log(`🎯 Evento ${item.id} (${item.name}): ${map[item.id] ? 'FAVORITO' : 'NO FAVORITO'}`);
    });

    console.log('📊 Map final:', map);
    return map;
  });

  /**
   * Carga todos los favoritos del tipo actual (eventos o lugares)
   */
  private loadAllFavorites(): void {
    console.log('🚀 Iniciando carga de favoritos...');
    console.log('📊 Tab actual:', this.tabService.currentTab());

    if (this.tabService.currentTab() === 0) {
      // Cargar favoritos de eventos
      console.log('📡 Cargando favoritos de eventos desde API...');
      this.favoriteEventsService.getAllFavorites().subscribe({
        next: (favorites) => {
          console.log('✅ Favoritos de eventos cargados:', favorites);
          console.log('📋 IDs de favoritos:', favorites.map(f => f.id));
        },
        error: (error) => {
          console.warn('⚠️ Error cargando favoritos de eventos:', error.status || 'Unknown error');
        }
      });
    } else {
      // Cargar favoritos de lugares
      console.log('📡 Cargando favoritos de lugares desde API...');
      this.favoritePlacesService.getAllFavorites().subscribe({
        next: (favorites) => {
          console.log('✅ Favoritos de lugares cargados:', favorites);
          console.log('📋 IDs de favoritos:', favorites.map(f => f.id));
        },
        error: (error) => {
          console.warn('⚠️ Error cargando favoritos de lugares:', error.status || 'Unknown error');
        }
      });
    }
  }

  /**
   * Método público para refrescar los favoritos
   */
  public refreshFavorites(): void {
    console.log('Slider: Refrescando favoritos...');
    this.loadAllFavorites();
  }

  /**
   * Obtiene el estado de favorito para un item específico
   * Solo se usa como fallback si no tenemos los datos en el mapa
   */
  private fetchFavoriteStatus(itemId: number): void {
    // Solo hacer la llamada individual si no tenemos el dato en el mapa
    const currentMap = this.favoriteMap();
    if (currentMap[itemId] === undefined) {
      if (this.tabService.currentTab() === 0) {
        this.favoriteEventsService.fetchFavoriteStatus(itemId);
      } else {
        this.favoritePlacesService.fetchFavoriteStatus(itemId);
      }
    }
  }

  favoriteEvents = signal<number[]>([]);
  current = this.favoriteEvents();

  isFavorite(id: number): boolean {
    return !!this.favoriteMap()[id];
  }

  /**
   * Verifica si un evento específico del array está en favoritos
   */
  isEventFavorite(eventId: number): boolean {
    const eventsMap = this.eventsFavoriteMap();
    const isFav = eventsMap[eventId] === true;

    console.log(`💖 Verificando evento ${eventId}:`);
    console.log(`   - Map de eventos:`, eventsMap);
    console.log(`   - ¿Está en favoritos? ${isFav}`);
    console.log(`   - Valor en map: ${eventsMap[eventId]}`);

    return isFav;
  }

  /**
   * Debug: Muestra el estado actual del map de favoritos
   */
  debugFavoriteMap(): void {
    console.log('Estado actual del favoriteMap:', this.favoriteMap());
    console.log('Estado actual del eventsFavoriteMap:', this.eventsFavoriteMap());
    console.log('IDs de eventos en el array:', this.items?.map(item => item.id));
  }

  ngAfterViewInit(): void {
    this.initEmbla();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items.length > 0) {
      this.reinitEmbla();
      // No necesitamos hacer llamadas individuales ya que loadAllFavorites
      // en ngOnInit ya cargó todos los favoritos
      console.log('Slider: Items changed, reinitializing carousel');
    }
  }

  private initEmbla(): void {
    if (this.viewportRef?.nativeElement) {
      const options: EmblaOptionsType = {
        loop: false,
        align: 'start',
        slidesToScroll: 1
      };
      this.embla = EmblaCarousel(this.viewportRef.nativeElement, options);
    }
  }

  private reinitEmbla(): void {
    // Detener el anterior
    this.embla?.destroy();
    this.embla = null;

    // Forzar cambio en DOM para re-renderizar el slider
    this.cdr.detectChanges();

    // Volver a iniciar cuando el DOM haya actualizado
    setTimeout(() => {
      this.initEmbla();
    }, 0);
  }

  scrollPrev(): void {
    this.embla?.scrollPrev();
  }

  scrollNext(): void {
    this.embla?.scrollNext();
  }

  trackByItem(index: number, item: any): string {
    return item.id || `${item.title}-${index}`;
  }

  onToggleFavorite(itemId: number): void {
    console.log('Slider: onToggleFavorite called with itemId:', itemId);
    if (this.tabService.currentTab() === 0) {
      this.toggleFavoriteEvent.emit(itemId);
    } else {
      this.toggleFavoritePlace.emit(itemId);
    }
  }

}

