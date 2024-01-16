import { Component,EventEmitter,Output, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {

  @ViewChild('inputbox') input: ElementRef;
  @Output() submitEvent = new EventEmitter<string>();

  onSubmit(event) {
    this.submitEvent.emit(event);
  }

  ngAfterViewInit(){
    this.input.nativeElement.focus();
  }
}
