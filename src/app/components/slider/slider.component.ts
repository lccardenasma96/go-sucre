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
  constructor(private cdr: ChangeDetectorRef) {
    console.log('Slider: constructor called, toggleFavoriteEvent output exists:', !!this.toggleFavoriteEvent);

    effect(() => {
      console.log('Tab cambió a:', this.tabService.currentTab());
    });
  }


  readonly favoriteMap = computed(() =>
    this.tabService.currentTab() === 0
      ? this.favoriteEventsService.favoriteMapComputed()
      : this.favoritePlacesService.favoriteMapComputed()
  );
  
  ngOnInit(): void {
    console.log('Slider: ngOnInit called with items:', this.items?.length);
    if (!this.items) {
      this.items = [];
    }
    setTimeout(() => {
      this.items.forEach(item => {
        this.favoriteEventsService.fetchFavoriteStatus(item.id);
        this.favoritePlacesService.fetchFavoriteStatus(item.id);
      });
    });
  }
  favoriteEvents = signal<number[]>([]);
  current = this.favoriteEvents();
  private tabService = inject(TabService);


  isFavorite(id: number): boolean {
    return !!this.favoriteMap()[id];
  }

  ngAfterViewInit(): void {
    this.initEmbla();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items.length > 0) {
      this.reinitEmbla();
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
    if (this.tabService.currentTab() === 0) {
      this.toggleFavoriteEvent.emit(itemId);
    } else {
      this.toggleFavoritePlace.emit(itemId);
    }
  }

}

