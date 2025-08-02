import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';
import { DialogAuthComponent } from '../components/dialog-auth/dialog-auth.component';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private loggedIn = new BehaviorSubject<boolean>(this.isTokenValid());
  private dialog = inject(MatDialog);

  authStatus$ = this.loggedIn.asObservable();

  constructor(private router: Router) { }

  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp && decoded.exp > now;
    } catch (e) {
      return false;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loggedIn.next(true);
    this.startTokenExpirationWatcher(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn.next(false);
  }

  // Método para logout con apertura del dialog de autenticación
  logoutWithExpirationDialog(): void {
    this.logout();
    this.openAuthDialogWithExpirationMessage();
    this.router.navigate(['/']);

  }

  // Método para abrir el dialog con mensaje de expiración
  private openAuthDialogWithExpirationMessage(): void {
    const dialogRef = this.dialog.open(DialogAuthComponent, { 
      restoreFocus: false,
      data: { showExpirationMessage: true }
    });
  }

  // 🕒 Detecta cuándo expira el token y desloguea automáticamente
  startTokenExpirationWatcher(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // en ms
      const now = Date.now();
      const timeout = expirationTime - now;

      if (timeout > 0) {
        setTimeout(() => {
          this.logoutWithExpirationDialog();
        }, timeout);
      } else {
        this.logoutWithExpirationDialog();
      }
    } catch (e) {
      this.logoutWithExpirationDialog();
    }
  }
}
