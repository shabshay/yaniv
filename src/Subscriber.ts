import { Subject } from 'rxjs';
import { Directive, OnDestroy } from '@angular/core';

@Directive()
export class SubscriberDirective implements OnDestroy {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  $onDestroy(): void {
    this.ngOnDestroy();
  }
}
