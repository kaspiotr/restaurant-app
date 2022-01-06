import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  form: FormGroup;
  hide = true;

  constructor(private _FromBuilder: FormBuilder,
              private _AuthService: AuthService,
              private _AngularFireAuth: AngularFireAuth,
              private _Router: Router,
              private _UserService: UserService) {
    this.form = _FromBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      role: ["", Validators.required]
    })
  }

  ngOnInit(): void {
  }

  signUp() {
    console.log(this.form.value);
    if (this.form.valid) {
      this._AuthService.signUp(this.form.value.email, this.form.value.password, this.form.value.role,
        () => {
          console.log("Rejestracja użytkownika powiodła się.")
          alert("Rejestracja użytkownika powiodła się.")
          this.form.reset()
        },
        () => {
          console.log("Błąd rejestracji użytkownika.")
        });
    }
  }
}

