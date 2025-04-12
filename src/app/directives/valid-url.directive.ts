import {Directive, ElementRef, Renderer2, Input} from '@angular/core';

@Directive({
  selector: '[appValidUrl]',
  standalone: true
})
export class ValidUrlDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  @Input() set appValidUrl(text: string) {
    const words = text.split(/\s+/);

    words.forEach((word) => {
      if (this.isValidURL(word)) {
        const anchor = this.renderer.createElement('a');
        this.renderer.setAttribute(anchor, 'href', word);
        this.renderer.setAttribute(anchor, 'target', '_blank'); // Open link in a new tab
        this.renderer.appendChild(anchor, this.renderer.createText(word));
        this.renderer.appendChild(this.el.nativeElement, anchor);
        this.renderer.setStyle(anchor, 'color', '#0b57d9',);
        this.renderer.setStyle(anchor, 'text-decoration', 'underline',);
        this.renderer.appendChild(this.el.nativeElement, this.renderer.createText(' ')); // Add space between links
      } else {
        this.renderer.appendChild(this.el.nativeElement, this.renderer.createText(word + ' '));
        this.renderer.setStyle(this.el.nativeElement, 'color', '#000');
      }
    });
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}
