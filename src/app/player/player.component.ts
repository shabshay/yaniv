import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Player} from './player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: Player;

  @Output()
  yanivClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onYanivClick(): void {
    this.yanivClick.emit();
  }
}
