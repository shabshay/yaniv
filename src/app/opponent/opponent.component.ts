import {Component, Input, OnInit} from '@angular/core';
import {IPlayer} from '../player/player';

@Component({
  selector: 'app-opponent',
  templateUrl: './opponent.component.html',
  styleUrls: ['./opponent.component.less']
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: IPlayer;

  constructor() { }

  ngOnInit(): void {
  }

}
