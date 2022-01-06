import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {CommunicationService, MsgType} from "./communication.service";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";
import {Order} from "../model/order.model";
import {OrderService} from "./order.service";
import {AuthService} from "./auth.service";
import {MealService} from "./meal.service";

const RATINGS_COLLECTION: string = "ratings";

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  userRatingsSubject = new Subject<Rating[]>();

  userRatings: Rating[] = [];
  userOrders: Order[] = [];
  private userId: string = "";

  constructor(private firestore: AngularFirestore,
              private communicationService: CommunicationService,
              private orderService: OrderService,
              private authService: AuthService,
              private mealService: MealService) {
    this.orderService.orderHistorySubject
      .subscribe(orders => {
        console.log("user orders")
        this.userOrders = orders
      });

    this.authService.userDataChanged.subscribe(() => {
      console.log("fetching ratings")
      this.userId = this.authService.getUserData().user.id
      this.getRatingsByUserId(this.userId)
    });
    this.authService.userDataChanged.next();
    this.orderService.publishOrderHistoryChanged();
  }

  addRating(rating: Rating) {
    this.getMealRatings(rating.mealId)
      .then(mealRatings => {
          if (!this.canAddRating(rating, mealRatings)) {
            return new Promise(() => null);
          }
          return this.firestore.collection<Rating>(RATINGS_COLLECTION)
            .add(rating)
            .then(docRef => {
              console.log(docRef)
              rating.id = docRef.id
              return this.firestore.doc(RATINGS_COLLECTION + "/" + docRef.id)
                .update(rating)
                .then(() => {
                  console.log("new rating added:")
                  console.log(rating)
                  mealRatings.push(rating)
                  const avgRating = mealRatings.reduce((sum, rating) => sum + rating.rating, 0) / mealRatings.length
                  return this.mealService.updateRating(rating.mealId, avgRating)
                    .then(() => {
                      this.userRatings.push(rating);
                      this.communicationService.publishMessage('dziękujemy za ocenę', MsgType.INFO, 3000);
                      this.publishUserRatingsChanged();
                    })
                })
                .catch(error => {
                  console.log(error)
                  throw error
                })
            })
        });
  }

  private getMealRatings(mealId: string): Promise<Rating[]> {
    return this.firestore.collection<Rating>(RATINGS_COLLECTION, ref => ref.where('mealId', '==', mealId))
      .get()
      .toPromise()
      .then(data => {
        return data.docs.map(doc => doc.data())
      });
  }

  private getRatingsByUserId(userId: string) {
    this.firestore.collection<Rating>(RATINGS_COLLECTION, ref => ref.where('userId', '==', userId))
      .get()
      .pipe(map(data => {
        return data.docs.map(doc => doc.data())
      }))
      .subscribe(ratings => {
        this.userRatings = ratings;
        this.publishUserRatingsChanged();
      })
  }

  publishUserRatingsChanged() {
    this.userRatingsSubject.next(JSON.parse(JSON.stringify(this.userRatings)));
  }

  private canAddRating(rating: Rating, mealRatings: Rating[]) {
    const existsRating = mealRatings.findIndex(rat => rat.userId == rating.userId) !== -1;

    if (existsRating) {
      this.communicationService.publishMessage(`Już oceniałeś tę potrawę!`, MsgType.ERROR, 4000)
      return false;
    }

    const existsOrder = this.userOrders.findIndex(order => order.details
      .findIndex(det => det.id === rating.mealId) !== -1) !== -1

    if (!existsOrder) {
      this.communicationService.publishMessage(`Nigdy nie jadłeś tego dania!`, MsgType.ERROR, 4000);
      return false;
    }

    return true;
  }
}

export interface Rating {
  id: string,
  userId: string,
  mealId: string
  rating: number
}
