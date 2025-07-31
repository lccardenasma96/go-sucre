import {
  Component,
  AfterViewInit,
  Inject,
  NgZone,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MUNICIPIOS } from './municipios';
import { MunicipioService } from '../../services/municipio';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maps.html',
  styleUrl: './maps.css'
})
export class Maps implements AfterViewInit {
  municipios: any[] = [];
  selectedPath: SVGPathElement | null = null;

  @Output() municipioSeleccionado = new EventEmitter<void>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private municipioService: MunicipioService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
  this.municipioService.getMunicipios().subscribe(data => {
    this.municipios = data;
  });
}

  ngAfterViewInit() {
    const paths = this.document.querySelectorAll('path') as NodeListOf<SVGPathElement>;

    paths.forEach(path => {
      const originalFill = path.getAttribute('fill') || path.style.fill;
      path.setAttribute('data-original-fill', originalFill);

      path.addEventListener('mouseenter', () => {
        if (this.selectedPath !== path) {
          path.style.fill = 'white';
        }
      });

      path.addEventListener('mouseleave', () => {
        if (this.selectedPath !== path) {
          const storedFill = path.getAttribute('data-original-fill');
          path.style.fill = storedFill || originalFill;
        }
      });

      path.addEventListener('click', () => {
        if (this.selectedPath && this.selectedPath !== path) {
          const prevFill = this.selectedPath.getAttribute('data-original-fill');
          if (prevFill) {
            this.selectedPath.style.fill = prevFill;
          }
        }

        if (this.selectedPath === path) {
          const storedFill = path.getAttribute('data-original-fill');
          path.style.fill = storedFill || '#ccc';
          this.selectedPath = null;
          this.zone.run(() => this.municipioService.setSelectedMunicipio(null));
          return;
        }

        if (!path.hasAttribute('data-original-fill')) {
          const originalFill = path.getAttribute('fill') || path.style.fill;
          path.setAttribute('data-original-fill', originalFill);
        }

        path.style.fill = `url(#fill-${path.id})`;
        this.selectedPath = path;

        const municipio = this.municipios.find((m: any) => m.slug === path.id);

        this.zone.run(() => {
          this.municipioService.setSelectedMunicipio(municipio);

          // ✅ Solo emite el evento si el ancho es 768px o menor (mobile)
          if (window.innerWidth <= 768) {
            this.municipioSeleccionado.emit();
          }
        });

        console.log('Seleccionado:', path.id);
      });
    });
  }
}
