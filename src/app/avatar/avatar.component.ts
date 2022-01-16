import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../game/game.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  avatarImageSrc = '../../assets/avatar1.png';

  @Input()
  isCurrentPlayer = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
