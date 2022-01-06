import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  form: FormGroup;

  constructor(private _FromBuilder: FormBuilder,
              private _AuthService: AuthService,
              private _AngularFireAuth: AngularFireAuth,
              private _Router: Router,
              private _UserService: UserService) {
    this.form = _FromBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    })
  }

  ngOnInit(): void {
  }

  signIn() {
    console.log(this.form.value);
    const userService = this._UserService;
    if (this.form.valid) {
      this._AuthService.signIn(this.form.value.email, this.form.value.password,
        () => {
          console.log("Logowanie użytkownika powiodło się.")
          this._AngularFireAuth.onAuthStateChanged(function (user) {
              if (user) {
                userService.getUserById(user.uid).subscribe(userInfo => {
                  user?.getIdToken().then(idToken => {
                    let userObject = {
                      user: {
                        id: user.uid,
                        email: user.email,
                        role: userInfo.role
                      },
                      token: idToken
                    }
                    sessionStorage.setItem('userData', JSON.stringify(userObject));
                  })
                })
              }
            })
            },
            () => {
              console.log("Błąd logowania użytkownika.")
            });
        }
    }
  }
