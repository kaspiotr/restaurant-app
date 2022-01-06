import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {User} from "../model/user.model";
import firebase from "firebase/compat/app";
import UserCredential = firebase.auth.UserCredential;
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const USERS_COLLECTION = "users";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: AngularFirestore) {
  }

  createUser(userCredential: UserCredential, userInfo: User) {
    const data = {
      id: userCredential.user?.uid,
      email: userInfo.email,
      role: userInfo.role
    };

    return this.firestore.collection(USERS_COLLECTION)
      .add(data).then(res => {
        console.log(res);
      }).catch(error => {
        console.log(error);
      })
  }

  getUsers() {
    return this.firestore.collection(USERS_COLLECTION).snapshotChanges()
  }

  getUserById(userId: string): Observable<User> {
    return this.firestore.collection<User>(USERS_COLLECTION, ref => ref.where('id', '==', userId))
      .get()
      .pipe(map(data => {
        return data.docs[0].data()
      }))
  }

}
