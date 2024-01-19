import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ViewChild, ElementRef, signal} from '@angular/core';
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
  public modalViewToggle = signal(false);
  public incomingMessages:[] = [];

  constructor(private webSocketService:WebSocketService){ }

  ngOnInit() {
    // Example: Sending a message
    // this.webSocketService.sendMessage('Hello WebSocket!');
    let name, id;
    name = sessionStorage.getItem('name');
    id = sessionStorage.getItem('id');
    console.log((JSON.parse(name)),JSON.parse(id)); 
    if(name && id){
      this.modalViewToggle.set(false);
      this.webSocketService.connect();
    }else{
      this.modalViewToggle.set(true);
    }
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

  generateId(){
    return Math.floor(Math.random() * 99999);
  }
  
  handleModalSubmit(inputText: any) {
    this.webSocketService.connect();

    let id = this.generateId();
    let obj = { name:'', id:0}

    console.log('name of user:', this.modalInput);

    obj.id = this.generateId();
    obj.name = this.modalInput;
    this.setFlagProcessing();    

  // Subscribe to isChatConnected observable to be notified when the connection is open
  const subscription = this.webSocketService.isChatConnected.subscribe((status) => {
    if (status) {
      // Connection is open, send the message
      this.webSocketService.sendMessage(obj);

      // Generate a random delay between 1000 and 1500 ms
      const randomDelay = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
      setTimeout(() => {
        this.modalViewToggle.set(false);
        this.modalInput = ''; // Clear the input text after sending the message
        subscription.unsubscribe(); // Unsubscribe to avoid memory leaks
      }, randomDelay);
    } else {
      // Connection is not open yet
      return;
    }
  });

    sessionStorage.setItem('name',JSON.stringify(this.modalInput));
    sessionStorage.setItem('id',JSON.stringify(id));
  }

  receiveMessages(){
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

  // checkChatConnectedStatus(){
  //   this.webSocketService.isChatConnected.subscribe((status)=>{
  //     return status;
  //   })
  // }

  setFlagProcessing(){
    this.webSocketService.isJoining.next(true);
    console.log(this.webSocketService.isJoining.value,'flag');
  }

  // sendMessage(message) {
  //   this.ws.send(message);
  // }

  onSubmit(){
    this.webSocketService.sendMessage(this.inputString);
    this.inputString = '';
  }

}
