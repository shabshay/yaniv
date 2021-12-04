import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../player/player';

@Component({
  selector: 'app-opponent',
  templateUrl: './opponent.component.html',
  styleUrls: ['./opponent.component.less']
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: Player;

  constructor() { }

  ngOnInit(): void {
  }

}
