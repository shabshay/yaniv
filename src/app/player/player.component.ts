import {Component, Input, OnInit} from '@angular/core';
import {Player} from './player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: Player;
  constructor() { }

  ngOnInit(): void {
  }

}
