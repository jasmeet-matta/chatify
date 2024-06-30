import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, ViewChild, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT, NgClass, TitleCasePipe, isPlatformBrowser } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { WebSocketService } from '../../services/web-socket.service';
import { NotificationService } from '../../services/notification.service';
import { ValidUrlDirective } from '../../directives/valid-url.directive';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,ModalComponent,BackdropComponent,NgClass, ValidUrlDirective],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class DefaultComponent implements OnInit {

  @ViewChild('scrollMe',{static:true}) scrollToBottom:ElementRef;
  @ViewChild('inputbox') input: ElementRef;
  @ViewChild('dropdownMenu') toggleMenu: ElementRef;

  public title:string = 'Chatify';
  public inputPlaceholder:string = 'type your message here...'
  public chatRoom:string = '/assets/chat.png';
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
  public isToggle:boolean = false;
  public playSound:boolean = true;

  constructor(
    private webSocketService:WebSocketService,
    private notificationService:NotificationService,
    private titlecasePipe:TitleCasePipe,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ){ }

  ngOnInit() {
    this.loadPrevMessages();
    this.getNotificationPermission();
    this.chatInit();
  }

  chatInit(){
    let name, id;
    if (isPlatformBrowser(this.platformId)) {
      name = sessionStorage.getItem('name');
      id = sessionStorage.getItem('id');
    }
    if(name && id){
      this.modalViewToggle.set(false);
      this.webSocketService.connect();
      this.receiveMessages();
      this.id = id;
      this.username = JSON.parse(name);
      this.scrollBottom();
    }else{
      this.modalViewToggle.set(true);
    }
  }

  getNotificationPermission(){
    if (isPlatformBrowser(this.platformId)) {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.error('Notification permission denied');
        }
      });
    }
  }

  loadPrevMessages(){
    if (isPlatformBrowser(this.platformId)) {
      const sessionStorage = document.defaultView?.sessionStorage;
      if (sessionStorage) {
        const storedMessages = sessionStorage.getItem('incomingMessages');  
        this.incomingMessages = JSON.parse(storedMessages);
      }
    }
  }

  getSoundPrefs(){
    const sound = sessionStorage.getItem('notificationSound');
    if(sound){
      this.playSound = JSON.parse(sound);
    }
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const clickedOnSmileyIcon = clickedElement.classList.contains('left-smiley');
    const emojiDrawer = clickedElement.classList.contains('drawer');
    const menuIcon = clickedElement.classList.contains('menu-icon');
    const clickedInsideDropdown = clickedElement.closest('.drop-menu') !== null;    
    if(clickedOnSmileyIcon == true || menuIcon == true){
      return;
    }
    this.showEmojis = clickedOnSmileyIcon || emojiDrawer;
    this.isToggle = menuIcon || clickedInsideDropdown;
  }
  
  toggleEmojiDrawer(){
    this.showEmojis = !this.showEmojis
  }

  getEmoji(event:any){
    this.inputString += event.detail.unicode;
  }

  generateId(){
    return Math.floor(Math.random() * 99999);
  }
  
  handleModalSubmit(inputText: any) {
    this.webSocketService.connect();
    let id = this.generateId();
    let obj = { name:'', id:0}
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
        this.modalInput = '';
        subscription.unsubscribe();
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
    this.webSocketService.getMessage().subscribe((event: MessageEvent) => {
      // Convert the blob to an array buffer
      const arrayBufferPromise = event.data.arrayBuffer();
      arrayBufferPromise.then((arrayBuffer) => {
        // Convert the array buffer to text
        const text = new TextDecoder('utf-8').decode(arrayBuffer);

        if(Object.keys(JSON.parse(text)).length == 2){
          const name = JSON.parse(text).name 
          const joined = name + ' ' + 'joined the chat';
          this.incomingMessages.push({type:'joinedLeft',text:joined})
        }//alert when someone leaves the chat
        else if(Object.keys(JSON.parse(text)).length == 1){
          const left = JSON.parse(text).message;
          this.incomingMessages.push({type:'joinedLeft',text:left})
        }else{
          this.incomingMessages.push(JSON.parse(text));
          let notifMessage = JSON.parse(text);
          this.handleNewMessage(notifMessage);
          sessionStorage.setItem('incomingMessages', JSON.stringify(this.incomingMessages));
        }
        this.scrollBottom();
      });
    });
  }

  setFlagProcessing(){
    this.webSocketService.isJoining.next(true);
  }

  onSubmit(){
    if(this.inputString.trim() !== ''){
      let obj = {name:'',id:0,message:'',time:''};
      obj.name =  this.username;
      obj.id = this.id;
      obj.message = this.inputString.trim();
      obj.time = this.getCurrTime();
      //explicit id zero to identify outgoing messages
      this.incomingMessages.push({...obj,id:0}); 
      this.webSocketService.sendMessage(JSON.stringify(obj));
      this.inputString = '';
      this.scrollBottom();
      sessionStorage.setItem('incomingMessages', JSON.stringify(this.incomingMessages));
    }else {
      // Reset cursor to start if input is empty or contains only whitespace
      this.inputString = '';
    }
  }

  playNotificationSound(){
    let audio = new Audio();
    audio.src = "/assets/notification.mp3";
    audio.load();
    audio.play();
  }
  
  togglePlaySound() {
    this.playSound = !this.playSound;
    sessionStorage.setItem('notificationSound', JSON.stringify(this.playSound));
  }

  toggleHeaderMenu(){
    this.isToggle = !this.isToggle;
  }

  async handleNewMessage(message: any): Promise<void> {
    if (this.document.visibilityState === 'visible') {
      // Don't show notification when the tab is visible
      return;
    }
    if(this.playSound){
      this.playNotificationSound();
    }
    // Show a notification
    let name = this.titlecasePipe.transform(message.name);
    const notification = this.notificationService.showNotification(name, {
      body: message.message,
      icon: '/assets/chat.png',
      silent:true
    });
    // Attach click event listener to the notification
    if (notification) {
      (await notification).onclick = (event: Event) => {
        window.focus();
      };
    }
  }

  scrollBottom(){
    setTimeout(() => {
      this.scrollToBottom.nativeElement.scrollTop = this.scrollToBottom.nativeElement.scrollHeight;    
    }, 99);
  }

  getCurrTime(){
    let time = new Date();
    let currTime;
    currTime  = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');
    return currTime;
  }
}
