import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ViewChild, ElementRef} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { BackdropComponent } from '../backdrop/backdrop.component';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,ModalComponent,BackdropComponent],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class DefaultComponent implements OnInit {

  public title:string = 'Chatify';
  public inputPlaceholder:string = 'type your message here...'
  public chatRoom:string = '/assets/chat-room.png';
  public menu :string = '/assets/menu.png';
  public send:string = 'assets/send.png';
  public smiley:string = 'assets/smiley.png';
  public showEmojis:boolean = false;
  public inputString:any = '';

  isModalOpen = false;
  
  ws:any

  constructor(){
  }

  ngOnInit() { 
  }

  ngAfterViewInit(){
    this.ws = new WebSocket('wss://wooden-strengthened-origami.glitch.me/');

    this.ws.onopen = () => {
      console.log('Connected to the server');
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server'); 
    };
    // this.input.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const clickedOnSmileyIcon = clickedElement.classList.contains('left-smiley');
    const emojiDrawer = clickedElement.classList.contains('drawer');
    if(clickedOnSmileyIcon == true){
      return;
    }
    this.showEmojis = clickedOnSmileyIcon || emojiDrawer;
  }

  onInput(){
    console.log(this.inputString);
  }
  
  toggleEmojiDrawer(){
    this.showEmojis = !this.showEmojis
  }

  getEmoji(event:any){
    console.log(event.detail.unicode);
    this.inputString += event.detail.unicode;
  }
  
  handleModalSubmit(inputText: any) {
    console.log('Submitted input:', inputText);
    // You can now use the submitted input as needed in the parent component.
  }

  sendMessage(message) {
    this.ws.send(message);
  }

  onSubmit(){
    this.sendMessage(this.inputString);
    this.inputString = '';
  }

}
