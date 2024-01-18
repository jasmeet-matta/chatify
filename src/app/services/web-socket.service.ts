import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: WebSocket;
  private socketSubject: Subject<MessageEvent> = new Subject<MessageEvent>();

  constructor() {
    // Replace 'wss://your-server-url' with your WebSocket server URL
    this.socket = new WebSocket('wss://wooden-strengthened-origami.glitch.me');

    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
    });

    this.socket.addEventListener('message', (event) => {
      this.socketSubject.next(event);
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event);
    });
  }

  sendMessage(message: string | object): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  getMessage(): Observable<MessageEvent> {
    return this.socketSubject.asObservable();
  }

}

// import { Injectable } from '@angular/core';
// import { Observable, Observer, Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class WebSocketService {
//   private socket: WebSocket;
//   private messageSubject: Subject<MessageEvent>;
//   private reconnectInterval = 1000; // Adjust as needed
//   private maxReconnectAttempts = 10; // Adjust as needed
//   private currentReconnectAttempts = 0;

//   constructor() {
//     this.messageSubject = new Subject<MessageEvent>();
//     this.connect();
//   }

//   private connect() {
//     this.socket = new WebSocket('wss://your-websocket-url');

//     this.socket.addEventListener('open', (event) => {
//       console.log('WebSocket connection opened');
//       this.currentReconnectAttempts = 0; // Reset reconnect attempts on successful connection
//     });

//     this.socket.addEventListener('message', (event) => {
//       this.messageSubject.next(event);
//     });

//     this.socket.addEventListener('close', (event) => {
//       console.log('WebSocket connection closed');
//       this.scheduleReconnect();
//     });

//     this.socket.addEventListener('error', (event) => {
//       console.error('WebSocket error:', event);
//     });
//   }

//   private scheduleReconnect() {
//     if (this.currentReconnectAttempts < this.maxReconnectAttempts) {
//       console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
//       setTimeout(() => {
//         this.connect();
//         this.currentReconnectAttempts++;
//       }, this.reconnectInterval);
//     } else {
//       console.error('Exceeded maximum reconnect attempts. Stopping reconnection.');
//     }
//   }

//   sendMessage(message: string | object): void {
//     if (this.socket.readyState === WebSocket.OPEN) {
//       const serializedMessage = typeof message === 'string' ? message : JSON.stringify(message);
//       this.socket.send(serializedMessage);
//     }
//   }

//   getMessage(): Observable<MessageEvent> {
//     return this.messageSubject.asObservable();
//   }
// }
