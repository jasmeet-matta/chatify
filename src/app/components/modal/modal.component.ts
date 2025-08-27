import {Component, EventEmitter, Output, ViewChild, ElementRef, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {WebSocketService} from '../../services/web-socket.service';

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
  @Output() inputTextChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() inputText: string = '';
  public isJoining: boolean = false;
  public isMinLen: boolean = false;

  constructor(private webSocketService: WebSocketService) {
  }

  onSubmit(event: any) {
    if (this.isMinLen) {
      this.submitEvent.emit(event);
      this.isJoining = this.checkProcessingStatus();
    }
  }

  checkProcessingStatus() {
    return this.webSocketService.isJoining.value;
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }

  checkMinLen() {
    this.isMinLen = this.inputText.trim().length > 3;
  }
}
