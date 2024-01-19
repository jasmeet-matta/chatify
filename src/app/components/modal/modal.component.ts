import { Component,EventEmitter,Output, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/web-socket.service';

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
  public isJoining:boolean = false;

  constructor(private webSocketService:WebSocketService){}

  onSubmit(event) {
    this.submitEvent.emit(event);
    // console.log(this.isJoining.value,'val from modal for flag');
    this.isJoining = this.checkProcessingStatus();
    
  }

  checkProcessingStatus(){
    return this.webSocketService.isJoining.value;
  }

  ngAfterViewInit(){
    this.input.nativeElement.focus();
    // console.log(this.isJoining.value);
    
  }
  
}
