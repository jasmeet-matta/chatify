import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule, DOCUMENT, NgClass, TitleCasePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BackdropComponent} from '../backdrop/backdrop.component';
import {ModalComponent} from '../modal/modal.component';
import {NotificationService} from '../../services/notification.service';
import {ValidUrlDirective} from '../../directives/valid-url.directive';
import {WebSocketService} from '../../services/web-socket.service';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [
    BackdropComponent,
    CommonModule,
    FormsModule,
    ModalComponent,
    NgClass,
    ReactiveFormsModule,
    ValidUrlDirective
  ],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DefaultComponent implements OnInit {

  @ViewChild('scrollMe', {static: true}) scrollToBottom: ElementRef;
  @ViewChild('inputBox') input: ElementRef;
  @ViewChild('dropdownMenu') toggleMenu: ElementRef;

  chatRoom: string = '/assets/chat.png';
  id: number;
  inputPlaceholder: string = 'type your message here...'
  inputString: any = '';
  incomingMessages: any[] = [];
  isToggle: boolean = false;
  modalInput: string = '';
  menu: string = '/assets/menu.png';
  playSound: boolean = true;
  send: string = 'assets/send.png';
  smiley: string = 'assets/smiley.png';
  showEmojis: boolean = false;
  showJoinChatDialog = signal(false);
  title: string = 'Chatify';
  username: string;

  constructor(
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private titleCase: TitleCasePipe,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @HostListener('window:click', ['$event'])
  @HostListener('window:keydown', ['$event'])
  onEvent(event: any): void {
    const clickedElement = event.target as HTMLElement;
    const clickedOnSmileyIcon = clickedElement.classList.contains('left-smiley');
    const emojiDrawer = clickedElement.classList.contains('drawer');
    const menuIcon = clickedElement.classList.contains('menu-icon');
    const clickedInsideDropdown = clickedElement.closest('.drop-menu') !== null;
    if (clickedOnSmileyIcon == true || menuIcon == true) {
      return;
    }
    this.showEmojis = clickedOnSmileyIcon || emojiDrawer;
    this.isToggle = menuIcon || clickedInsideDropdown;

    if (event.code === 'Slash' && event.altKey) {
      this.input.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.initChat();
  }

  initChat() {
    this.getNotificationPermission();
    let name: string, id: any;
    name = sessionStorage.getItem('name');
    id = sessionStorage.getItem('id');
    if (name && id) {
      this.showJoinChatDialog.set(false);
      this.webSocketService.connect();
      this.receiveMessages();
      this.id = id;
      this.username = JSON.parse(name);
      this.loadPrevMessages()
      this.scrollBottom();
    } else {
      this.showJoinChatDialog.set(true);
    }
  }

  getNotificationPermission() {
    if (Notification) {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.error('Notification permission denied');
        }
      });
    }
  }

  loadPrevMessages() {
    const storedMessages = sessionStorage.getItem('incomingMessages');
    if (storedMessages) {
      this.incomingMessages = JSON.parse(storedMessages);
    }
  }

  toggleEmojiDrawer() {
    this.showEmojis = !this.showEmojis
  }

  getEmoji(event: any) {
    this.inputString += event.detail.unicode;
  }

  generateId() {
    return Math.floor(Math.random() * 99999);
  }

  handleModalSubmit() {
    this.webSocketService.connect();
    let id = this.generateId();
    let obj = {name: '', id: 0}
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
          this.showJoinChatDialog.set(false);
          this.modalInput = '';
          subscription.unsubscribe();
        }, randomDelay);
        this.receiveMessages();
      } else {
        // Connection is not open yet
        return;
      }
    });

    sessionStorage.setItem('name', JSON.stringify(this.modalInput));
    sessionStorage.setItem('id', JSON.stringify(id));
  }

  receiveMessages() {
    this.webSocketService.getMessage().subscribe((event: MessageEvent) => {
      // Convert the blob to an array buffer
      const arrayBufferPromise = event.data.arrayBuffer();
      arrayBufferPromise.then((arrayBuffer: any) => {
        // Convert the array buffer to text
        const text = new TextDecoder('utf-8').decode(arrayBuffer);

        if (Object.keys(JSON.parse(text)).length == 2) {
          const name = JSON.parse(text).name
          const joined = name + ' ' + 'joined the chat';
          this.incomingMessages.push({type: 'joinedLeft', text: joined})
        }//alert when someone leaves the chat
        else if (Object.keys(JSON.parse(text)).length == 1) {
          const left = JSON.parse(text).message;
          this.incomingMessages.push({type: 'joinedLeft', text: left})
        } else {
          this.incomingMessages.push(JSON.parse(text));
          let message = JSON.parse(text);
          this.handleNewMessage(message).then(r => r);
          sessionStorage.setItem('incomingMessages', JSON.stringify(this.incomingMessages));
        }
        this.scrollBottom();
      });
    });
  }

  setFlagProcessing() {
    this.webSocketService.isJoining.next(true);
  }

  onSubmit() {
    if (this.inputString.trim() !== '') {
      let obj = {name: '', id: 0, message: '', time: ''};
      obj.name = this.username;
      obj.id = this.id;
      obj.message = this.inputString.trim();
      obj.time = this.getCurrTime();
      //explicit id zero to identify outgoing messages
      this.incomingMessages.push({...obj, id: 0});
      this.webSocketService.sendMessage(JSON.stringify(obj));
      this.inputString = '';
      this.scrollBottom();
      sessionStorage.setItem('incomingMessages', JSON.stringify(this.incomingMessages));
    } else {
      // Reset cursor to start if input is empty or contains only whitespace
      this.inputString = '';
    }
  }

  playNotificationSound() {
    let audio = new Audio();
    audio.src = "/assets/notification.mp3";
    audio.load();
    audio.play()
      .then(() => {
        //Audio is playing successfully
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
      });
  }

  togglePlaySound() {
    this.playSound = !this.playSound;
    sessionStorage.setItem('notificationSound', JSON.stringify(this.playSound));
  }

  toggleHeaderMenu() {
    this.isToggle = !this.isToggle;
  }

  async handleNewMessage(message: any): Promise<void> {
    if (this.document.visibilityState === 'visible') {
      // Don't show notification when the tab is visible
      return;
    }
    if (this.playSound) {
      this.playNotificationSound();
    }
    // Show a notification
    let name = this.titleCase.transform(message.name);
    const notification = this.notificationService.showNotification(name, {
      body: message.message,
      icon: '/assets/chat.png',
      silent: true
    });
    // Attach click event listener to the notification
    if (notification) {
      (await notification).onclick = () => {
        window.focus();
      };
    }
  }

  scrollBottom() {
    setTimeout(() => {
      this.scrollToBottom.nativeElement.scrollTop = this.scrollToBottom.nativeElement.scrollHeight;
    }, 99);
  }

  getCurrTime() {
    let time = new Date();
    let currTime: string;
    currTime = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');
    return currTime;
  }
}
