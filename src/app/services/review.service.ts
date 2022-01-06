import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable, Subject} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat";
import {CommunicationService, MsgType} from "./communication.service";
import Timestamp = firebase.firestore.Timestamp;
import {OrderService} from "./order.service";
import {Order} from "../model/order.model";

const REVIEWS_COLLECTION: string = "reviews";

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private reviewsSubject = new Subject<Review[]>();

  reviews: Review[] = []
  userOrders: Order[] = [];
  review: Review
  counter = 0

  constructor(private firestore: AngularFirestore,
              private communicationService: CommunicationService,
              private orderService: OrderService) {
    this.review = ReviewService.createEmptyReview();
    this.orderService.orderHistorySubject
      .subscribe(orders => this.userOrders = orders)
  }

  getReviewsSubscription(): Observable<Review[]> {
    return this.reviewsSubject;
  }

  addReview(review: Review): Promise<Review | null> {
    if (!this.canAddReview(review)) {
      return new Promise(() => null);
    }
    this.review = review;
    this.review.id = "";
    if (!this.review.date) {
      this.review.date = new Date();
    }
    return this.firestore.collection<Review>(REVIEWS_COLLECTION)
      .add(this.review)
      .then(docRef => {
        console.log(docRef)
        this.review.id = docRef.id
        return this.firestore.doc(REVIEWS_COLLECTION + "/" + docRef.id)
          .update(this.review)
          .then(() => {
            console.log("new review:")
            console.log(this.review);
            this.reviews.push(this.review)
            const addedReview = this.review
            this.review = ReviewService.createEmptyReview()
            this.reviewsSubject.next(this.getSortedReviews())
            return addedReview
          })
          .catch(error => {
            console.log(error)
            throw error
          })
      })
  }

  getSortedReviews(): Review[] {
    function copy(reviews: Review[]): Review[] {
      return JSON.parse(JSON.stringify(reviews));
    }
    console.log("reviews from service: (before filtering)")
    console.log(this.reviews)
    const reviews = copy(this.reviews)
      .sort((r1, r2) => (r1.date?.getTime() || 0) - (r2.date?.getTime() || 0))

    console.log("reviews from service:")
    console.log(reviews)
    return reviews
  }

  getReviewsByMealId(mealId: string) {
    this.firestore.collection<Review>(REVIEWS_COLLECTION, ref => ref.where('mealId', '==', mealId))
      .get()
      .pipe(map(data => {
        return data.docs.map(doc => doc.data());
      }))
      .subscribe(reviews => {
        this.reviews = reviews;
        this.reviews.forEach(review => {
          // @ts-ignore
          const firebaseTimestamp = review.date as Timestamp;
          review.date = firebaseTimestamp.toDate()
        })
        this.publishReviewsChanged();
      })
  }

  private publishReviewsChanged() {
    this.reviewsSubject.next(JSON.parse(JSON.stringify(this.reviews)));
  }

  private static createEmptyReview(): Review {
    return {
      nick: "",
      title: "",
      content: "",
      date: new Date(),
      mealId: "",
      id: "",
      userId: ""
    };
  }

  fetchReviews() {
    this.publishReviewsChanged()
  }

  private canAddReview(review: Review): boolean {
    const existsReview = this.reviews.findIndex(rev => rev.userId == review.userId) !== -1;

    if (existsReview) {
      this.communicationService.publishMessage(`Już recenzowałeś tę potrawę!`, MsgType.ERROR, 4000);
      return false;
    }

    const existsOrder = this.userOrders.findIndex(order => order.details
      .findIndex(det => det.id === review.mealId) !== -1) !== -1

    if (!existsOrder) {
      this.communicationService.publishMessage(`Nigdy nie jadłeś tego dania!`, MsgType.ERROR, 4000);
      return false;
    }

    return true;
  }
}

export interface Review {
  nick: string
  title: string
  content: string
  date?: Date
  mealId: string
  id: string
  userId: string
}
