import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ViewChild, ElementRef} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { WebSocketService } from '../../services/web-socket.service';

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
  public modalInput:string = '';

  constructor(private webSocketService:WebSocketService){ 
  }

  ngOnInit() {
    // Example: Sending a message
    this.webSocketService.sendMessage('Hello WebSocket!');
    
    // Example: Receiving messages
    this.webSocketService.getMessage().subscribe((event: MessageEvent) => {
      // Convert the blob to an array buffer
      const arrayBufferPromise = event.data.arrayBuffer();
      arrayBufferPromise.then((arrayBuffer) => {
        // Convert the array buffer to text
        const text = new TextDecoder('utf-8').decode(arrayBuffer);
        
        console.log('Received message:', text);
        // Handle the received message as needed
      });
    });
  }

  ngAfterViewInit(){
    // this.ws = new WebSocket('wss://wooden-strengthened-origami.glitch.me/');

    // this.ws.onopen = () => {
    //   console.log('Connected to the server');
    // };

    // this.ws.onclose = () => {
    //   console.log('Disconnected from server'); 
    // };
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
    // console.log(this.inputString);
  }
  
  toggleEmojiDrawer(){
    this.showEmojis = !this.showEmojis
  }

  getEmoji(event:any){
    console.log(event.detail.unicode);
    this.inputString += event.detail.unicode;
  }
  
  handleModalSubmit(inputText: any) {
    let id = this.generateId();
    let obj = { name:'', id:0}
    console.log('name of user:', this.modalInput);
    obj.id = this.generateId();
    obj.name = this.modalInput;
    this.webSocketService.sendMessage(obj);
    sessionStorage.setItem('name',JSON.stringify(this.modalInput));
    sessionStorage.setItem('id',JSON.stringify(id));
    this.modalInput = ''; // Clear the input text after sending the message
    console.log(id);
  }

  // sendMessage(message) {
  //   this.ws.send(message);
  // }

  onSubmit(){
    this.webSocketService.sendMessage(this.inputString);
    this.inputString = '';
  }

  generateId(){
   return Math.floor(Math.random() * 99999);
  }

}
