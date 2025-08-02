import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MunicipioService {
  selectedMunicipio = signal<any | null>(null);

  private apiUrl = 'https://api-prueba-oe7m.onrender.com/api/v1/municipios';

  constructor(private http: HttpClient) {}

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  setSelectedMunicipio(municipio: any) {
    this.selectedMunicipio.set(municipio);
  }

  getSelectedMunicipio() {
    return this.selectedMunicipio(); // para usarlo como valor
  }

  selectedMunicipioSignal = this.selectedMunicipio.asReadonly(); // para observarlo
}
