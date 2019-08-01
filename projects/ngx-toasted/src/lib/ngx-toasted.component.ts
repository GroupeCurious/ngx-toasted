import { Component, Input, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'ngx-toasted',
  templateUrl: './ngx-toasted.component.html',
  styleUrls: ['./ngx-toasted.component.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),  // initial
        animate('0.5s cubic-bezier(.8, 0, 0.2, 1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*' }),
        animate('0.5s cubic-bezier(.8, 0, 0.2, 1.5)',
          style({
            transform: 'scale(0.9) translateY(-16px)', opacity: 0,
            height: '0px'
          }))
      ])
    ])
  ]
})
export class NgxToastedComponent implements OnDestroy {
  subscriptions: Subscription[] = [];

  innerToasts: InnerToast[] = [];
  @Input() addToast = new EventEmitter<Toast>();

  @Input() align: 'start' | 'end' = 'start';
  @Input() justify: 'start' | 'end' = 'start';
  @Input() reverse = false;

  constructor() {
    this.subscriptions.push(
      this.addToast.subscribe((toast: Toast) => {
        this.onToastAdded(toast);
      })
    );
  }

  ngOnDestroy(): void {
    this.innerToasts.forEach((toast: InnerToast) => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });

    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
  }

  private onToastAdded(toast: Toast) {
    if (!toast.id) {
      toast.id = this.generatePseudoUuid();
    }

    const alreadyExistingInnerToast = this.innerToasts.find((t: InnerToast) => t.toast.id === toast.id);
    if (alreadyExistingInnerToast) {
      /* Update toast */
      clearTimeout(alreadyExistingInnerToast.timeoutId);

      alreadyExistingInnerToast.toast.message = toast.message;
      alreadyExistingInnerToast.toast.duration = toast.duration;
      alreadyExistingInnerToast.toast.type = toast.type;

      if (toast.duration > 0) {
        alreadyExistingInnerToast.timeoutId = setTimeout(() => {
          const index = this.innerToasts.findIndex((t: InnerToast) => t.timeoutId === alreadyExistingInnerToast.timeoutId);
          if (index !== -1) {
            this.innerToasts.splice(index, 1);
          }
        }, toast.duration);
      }
    } else {
      /* Add toast */
      const newInnerToast = {
        toast
      } as InnerToast;
      this.innerToasts.push(newInnerToast);

      if (newInnerToast.toast.duration > 0) {
        newInnerToast.timeoutId = setTimeout(() => {
          const index = this.innerToasts.findIndex((t: InnerToast) => t.timeoutId === newInnerToast.timeoutId);
          if (index !== -1) {
            this.innerToasts.splice(index, 1);
          }
        }, toast.duration);
      }
    }
  }

  private generatePseudoUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

interface InnerToast {
  toast: Toast;
  timeoutId?: any;
}

export interface Toast {
  id?: string;
  message: string;
  duration: number;
  type: 'info' | 'success' | 'warning' | 'error';
}
