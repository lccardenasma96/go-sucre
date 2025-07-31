import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollAnimDirective } from '../../directives/scroll-anim.directive';



@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, ScrollAnimDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
    regiones = [
    { name: 'Sabanas', description: 'En el corazón del departamento, esta región vibra con música, ferias y tradiciones vivas. Desde Sincelejo hasta Sampués, el viajero encontrará fandango, artesanía y una fuerte identidad cultural costeña.' },
    { name: 'Mojana', description: 'Un territorio de agua y vida. Aquí las ciénagas, los canales y los pueblos anfibios como San Benito Abad y Majagual ofrecen paisajes únicos, pesca artesanal y contacto directo con la naturaleza.' },
    { name: 'Montes de María', description: 'Tierra de montañas suaves, cultura ancestral y música autóctona. Municipios como Colosó y Ovejas invitan a recorrer senderos ecológicos, conocer el bullerengue y descubrir historias de resistencia.' },
    { name: 'San Jorge', description: 'Una región fértil y tranquila, atravesada por el río San Jorge. San Marcos, Caimito y La Unión son paradas ideales para el agroturismo, la gastronomía tradicional y el descanso en entornos rurales.' },
    { name: 'Golfo de Morrosquillo', description: 'La joya costera de Sucre. En Tolú, Coveñas y San Onofre te esperan playas de ensueño, islas coralinas y experiencias náuticas perfectas para desconectarte y disfrutar del Caribe colombiano.' }
  ];

  @ViewChildren('detail') details!: QueryList<ElementRef<HTMLDetailsElement>>;

  onToggleRegions(opened: HTMLDetailsElement) {
    if (opened.open) {
      this.details.forEach((detail) => {
        if (detail.nativeElement !== opened) {
          detail.nativeElement.removeAttribute('open');
        }
      });
    }
  }


}
