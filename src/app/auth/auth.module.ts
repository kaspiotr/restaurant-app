import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthRoutingModule} from './auth-routing.module';
import {AngularFireAuth} from "@angular/fire/compat/auth";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule
  ]
})
export class AuthModule {

  constructor(public _AngularFireAuth: AngularFireAuth) {
  }
}
