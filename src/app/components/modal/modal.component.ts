import { Component,EventEmitter,Output, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {

  @ViewChild('inputbox') input: ElementRef;
  
  @Output() submitEvent = new EventEmitter<string>();
  @Input() inputText:string = '';
  @Output() inputTextChange: EventEmitter<string> = new EventEmitter<string>();

  onSubmit(event) {
    this.submitEvent.emit(event);
  }

  ngAfterViewInit(){
    this.input.nativeElement.focus();
  }
}
