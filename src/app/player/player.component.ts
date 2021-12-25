import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IPlayer} from './player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: IPlayer;

  @Input()
  yanivThreshold!: number;

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
