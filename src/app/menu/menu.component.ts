import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AuthService} from "../services/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  linkWrappers: LinkWrapper[];
  userData: any = null;
  private _userDataChangedSubscription: Subscription | null = null;

  constructor(private router: Router,
              private _AngularFireAuth: AngularFireAuth,
              private _AuthService: AuthService) {
    this.linkWrappers = [
      {title: "Strona główna", link: ''},
      {title: "Menu", link: 'menu'},
      {title: "Historia zamówień", link: 'order-history'},
      {title: "Koszyk", link: 'basket'}
    ]
  }

  ngOnInit(): void {
    this.userData = this._AuthService.getUserData();
    this._userDataChangedSubscription = this._AuthService.userDataChanged.subscribe(() => {
      this.userData = this._AuthService.getUserData();
    })

    const component = this;
    this._AngularFireAuth.onAuthStateChanged(function(user) {
      if (!user) {
        component.userData = null;
      }
    })
  }

  ngOnDestroy(): void {
    if (this._userDataChangedSubscription) {
      this._userDataChangedSubscription.unsubscribe();
    }
  }

  redirectTo(linkWrapper: LinkWrapper) {
    const component = this;

    if (linkWrapper.title === 'Zaloguj') {
      this.linkWrappers.pop();
      this.linkWrappers.pop();
      this.linkWrappers.push(
        {
          title: "Wyloguj (" + component.userData?.user?.email + " | " + component.userData?.user?.role + ")",
          link: ''
        })
    }

    if (linkWrapper.title.slice(0, 7) === 'Wyloguj') {
      this.linkWrappers.pop();
      this.signOut()
    }

    this.router.navigate([linkWrapper.link]);
  }

  signOut() {
    sessionStorage.setItem('userData', "");
    this._AngularFireAuth.signOut()
  }

  isAdmin() {
    return this.userData?.user?.role == 'ADMIN';
  }
}

class LinkWrapper {
  title: string
  link: string

  constructor(title: string, link: string) {
    this.title = title;
    this.link = link;
  }
}
