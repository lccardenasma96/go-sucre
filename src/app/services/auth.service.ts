import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private loggedIn = new BehaviorSubject<boolean>(this.isTokenValid());

  authStatus$ = this.loggedIn.asObservable();

  constructor() { }

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

  // 🕒 Detecta cuándo expira el token y desloguea automáticamente
  startTokenExpirationWatcher(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // en ms
      const now = Date.now();
      const timeout = expirationTime - now;

      if (timeout > 0) {
        setTimeout(() => {
          this.logout();
        }, timeout);
      } else {
        this.logout();
      }
    } catch (e) {
      this.logout();
    }
  }
}
