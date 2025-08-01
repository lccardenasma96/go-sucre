// tab.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  currentTab = signal<number>(0);
}