import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  viewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogAuthComponent } from '../dialog-auth/dialog-auth.component';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-custom',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './header-custom.component.html',
  styleUrl: './header-custom.component.css'
})
export class HeaderCustomComponent implements OnInit, OnDestroy {
  readonly menuTrigger = viewChild.required(MatMenuTrigger);
  readonly dialog = inject(MatDialog);

  isScrolled = false;
  userName: string | null = null;
  private authSub?: Subscription;

  constructor(
    public api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.auth.authStatus$.subscribe((isLoggedIn) => {
      this.userName = isLoggedIn ? this.getUserNameFromToken() : null;
    });
  
    if (this.auth.isAuthenticated()) {
      this.userName = this.getUserNameFromToken();
      const token = this.auth.getToken();
      if (token) {
        this.auth.startTokenExpirationWatcher(token);
      }
    }
  }
  
  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  getUserNameFromToken(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.name || null;
    } catch (e) {
      return null;
    }
  }

  toggleMenu() {
    const menu = document.querySelector("#menu-options_mobile");
    menu?.classList.toggle("menu-mobile_visible");
  }

  openDialogAuth() {
    const dialogRef = this.dialog.open(DialogAuthComponent, { restoreFocus: false });
    dialogRef.afterClosed().subscribe(() => this.menuTrigger().focus());
  }

  logout() {
    this.auth.logout(); // elimina token y emite logout
    window.location.reload();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
