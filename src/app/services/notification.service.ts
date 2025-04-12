import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showNotification(title: string, options?: NotificationOptions): Promise<Notification | null> {
    return new Promise((resolve) => {
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            const notification = new Notification(title, options);
            resolve(notification);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }
}
