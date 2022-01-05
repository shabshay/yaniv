import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../game/game.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.less']
})
export class AvatarComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  timeLeft?: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}