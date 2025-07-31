import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appScrollAnim]',
  standalone: true 
})
export class ScrollAnimDirective implements OnInit {
  @Input('appScrollAnim') animClass: string = 'visible';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, this.animClass);
        } else {
           this.renderer.removeClass(this.el.nativeElement, this.animClass);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(this.el.nativeElement);
  }
}
