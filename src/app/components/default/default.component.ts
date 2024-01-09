import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss'
})
export class DefaultComponent implements OnInit {

  public chatRoom:string = '/assets/chat-room.png';
  public menu :string = '/assets/menu.png';

  constructor(){ }

  ngOnInit() {
    
  }

}
