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
  signal
} from '@angular/core';

import { NgIf, NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

import EmblaCarousel from 'embla-carousel';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { FavoriteEventsService } from '../../services/favorite-events.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [NgIf, NgFor, MatIcon],
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
  constructor(private cdr: ChangeDetectorRef) {
    console.log('Slider: constructor called, toggleFavoriteEvent output exists:', !!this.toggleFavoriteEvent);
  }
  readonly favoriteMap = this.favoriteEventsService.favoriteMapComputed;

  ngOnInit(): void {
    console.log('Slider: ngOnInit called with items:', this.items?.length);
    if (!this.items) {
      this.items = [];
    }
    setTimeout(() => {
      this.items.forEach(item => {
        this.favoriteEventsService.fetchFavoriteStatus(item.id);
      });
    });
  }
  favoriteEvents = signal<number[]>([]);
  current = this.favoriteEvents();

  isFavorite(id: number): boolean {
    return this.favoriteEventsService.isFavoriteSignal(id);
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
  
    onToggleFavorite(eventId: number): void {
     
      console.log('Slider: onToggleFavorite called with eventId:', eventId, 'isEvent:', this.isEvent);
      console.log('Slider: toggleFavoriteEvent output exists:', !!this.toggleFavoriteEvent);
      
      // Siempre emitir el evento para que el padre pueda manejarlo
      this.toggleFavoriteEvent.emit(eventId);
      console.log('Slider: Event emitted successfully');
    }


    onToggleFavoritePlace(eventId: number): void {
      console.log('Slider: onToggleFavorite called with eventId:', eventId, 'isEvent:', this.isEvent);
      console.log('Slider: toggleFavoriteEvent output exists:', !!this.toggleFavoritePlace);
      
      // Siempre emitir el evento para que el padre pueda manejarlo
      this.toggleFavoritePlace.emit(eventId);
      console.log('Slider: Event emitted successfully');
    }
    
}

