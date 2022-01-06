import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router} from "@angular/router";
import {UserService} from "./user.service";
import {User} from "../model/user.model";
import {Subject} from "rxjs";
import firebase from "firebase/compat";
import UserInfo = firebase.UserInfo;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userInfo: User | undefined;
  userDataChanged = new Subject<void>();

  constructor(private _AngularFireAuth: AngularFireAuth,
              private _Router: Router,
              private _UserService: UserService) {
    this.setUserDataItem()
  }

  setUserDataItem() {
    let userService = this._UserService;
    this._AngularFireAuth.onAuthStateChanged(user => {
      if (user) {
        user?.getIdToken().then(idToken => {
          this._Router.navigate([''])
          userService.getUserById(user?.uid)
            .subscribe(userInfo => {
              let userObject = {
                user: {
                  id: userInfo.id,
                  email: user.email,
                  role: userInfo.role
                },
                token: idToken
              }
              this.userInfo = new User(user.uid, user.email, userInfo.role);
              const userData = JSON.stringify(userObject)
              sessionStorage.setItem('userData', userData);
              this.userDataChanged.next();
            })

        })
      } else {
        this._Router.navigate([''])
      }
    })
  }


  signIn(email: string, password: string, onSuccess: any, onError: any) {
    this._AngularFireAuth.signInWithEmailAndPassword(email, password)
      .then(result => {
        this.setUserDataItem()
        console.log(result)
        onSuccess()
        this._Router.navigate([''])
      })
      .catch(error => {
        console.log(error)
        onError();
      })
  }

  signOut() {
    this._AngularFireAuth.signOut()
      .then(() => {
        sessionStorage.setItem('userData', "");
        this._Router.navigate(['']);
      })
      .catch(error => console.log(error));
  }

  getUserData(): any {
    let userData = sessionStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  }

  signUp(email: string, password: string, role: string, onSuccess: any, onError: any) {
    this._AngularFireAuth.createUserWithEmailAndPassword(email, password)
      .then((firebaseUser) => {
        const user = new User(firebaseUser.user?.uid, email, role)
        this._UserService.createUser(firebaseUser, user);
        this._Router.navigate(['login'])
      })
      .catch(error => {
        console.log(error)
        onError();
      })
  }
}
