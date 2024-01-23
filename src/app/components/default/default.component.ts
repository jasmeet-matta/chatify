import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,ModalComponent,BackdropComponent,NgClass],
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
  public incomingMessages:any[] = [];
  public id:number;
  public username:string;

  constructor(private webSocketService:WebSocketService){ }

  ngOnInit() {
    this.loadPrevMessages();
    // Example: Sending a message
    // this.webSocketService.sendMessage('Hello WebSocket!');
    let name, id;
    name = sessionStorage.getItem('name');
    id = sessionStorage.getItem('id');
    console.log((JSON.parse(name)),JSON.parse(id)); 
    if(name && id){
      this.modalViewToggle.set(false);
      this.webSocketService.connect();
      this.receiveMessages();
      this.id = id;
      this.username = JSON.parse(name);
    }else{
      this.modalViewToggle.set(true);
    }
  }

  loadPrevMessages(){
    // Retrieve stored messages from session storage
    const storedMessages = sessionStorage.getItem('incomingMessages');

    // Parse the stored messages and update the array
    if (storedMessages) {
      this.incomingMessages = JSON.parse(storedMessages);
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
    this.id = obj.id;
    this.username = obj.name;
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
      this.receiveMessages();
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

        //alert when new person joins
        if(Object.keys(JSON.parse(text)).length == 2){
          alert(`${JSON.parse(text).name} joined the chat`);
        }else{
          this.incomingMessages.push(JSON.parse(text));
          sessionStorage.setItem('incomingMessages', JSON.stringify(this.incomingMessages));
        }
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
    if(this.inputString !== ''){
      let obj = {name:'',id:0,message:'',time:''};
      obj.name =  this.username;
      obj.id = this.id;
      obj.message = this.inputString;
      obj.time = this.getCurrTime();
      //explicit id zero to identify outgoing messages
      this.incomingMessages.push({...obj,id:0}); 
      this.webSocketService.sendMessage(JSON.stringify(obj));
      this.inputString = '';
    }
  }

  getCurrTime(){
    let time = new Date();
    let currTime;
    currTime  = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');
    return currTime;
  }

}
