import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxToastedComponent } from './ngx-toasted.component';

@NgModule({
  declarations: [
    NgxToastedComponent
  ],
  exports: [
    NgxToastedComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NgxToastedModule { }
