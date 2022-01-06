import {Injectable} from '@angular/core';
import {Order} from "../model/order.model";
import {Observable, Subject} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {map} from "rxjs/operators";
import {AuthService} from "./auth.service";
import firebase from "firebase/compat";
import {CommunicationService, MsgType} from "./communication.service";
import Timestamp = firebase.firestore.Timestamp;
import {MealService} from "./meal.service";

const ORDERS_COLLECTION: string = "orders";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderCountSubject = new Subject<number>();
  private orderSubject = new Subject<Order>();
  orderHistorySubject = new Subject<Order[]>();

  order: Order
  orderId = 1;
  private orderHistory: Order[] = [];


  constructor(private firestore: AngularFirestore,
              private authService: AuthService,
              private mealService: MealService,
              private communicationService: CommunicationService) {
    this.order = OrderService.createEmptyOrder()
    this.authService.userDataChanged.subscribe(() => {
      const userData = this.authService.getUserData();
      if (userData) {
        this.getUserOrdersByUserId(userData.user.id);
        this.publishOrderHistoryChanged();
      }
    })
  }

  private static createEmptyOrder(): Order {
    return {
      id: "",
      date: new Date(),
      details: [],
      userId: ""
    };
  }

  getOrderCount(): Observable<number> {
    return this.orderCountSubject
  }

  addToOrder(id: string, name: string, count: number, priceForPiece: number) {
    let detail = this.order.details.find(det => det.id == id)
    if (!detail) {
      detail = {id: id, name: name, amount: count, price: priceForPiece}
      this.order.details.push(detail)
    } else {
      detail.price = priceForPiece
      detail.amount += count
    }
    this.publishOrderCountChange();
  }

  private publishOrderCountChange() {
    const dishesCount = this.order.details.map(det => det.amount).reduce((a, b) => a + b, 0);
    this.orderCountSubject.next(dishesCount);
  }

  getOrderSubscription(): Observable<Order> {
    return this.orderSubject
  }

  fetchOrders() {
    this.orderSubject.next(this.order)
  }

  deleteFromOrder(id: string) {
    const mealToDeleteIdx = this.order.details.findIndex(det => det.id == id)
    const deletedMeal = this.order.details.filter(delMeal => delMeal.id == id)[0]
    if (mealToDeleteIdx == -1) return
    this.order.details.splice(mealToDeleteIdx, 1)
    this.orderSubject.next(this.order)
    this.publishOrderCountChange()
    this.communicationService.publishMessage(`Usunięto ${deletedMeal.name} z koszyka`, MsgType.SUCCESS, 5000)
  }

  fetchOrdersCount() {
    this.publishOrderCountChange()
  }

  isInBasket(id: string): boolean {
    return this.order.details.findIndex(det => det.id == id) !== -1;
  }

  getMealInBasketCount(id: string) {
    const foundDish = this.order.details.find(det => det.id === id)
    if (!foundDish) return 0
    return foundDish.amount;
  }

  submitOrder(userId: string): void {
    this.order.userId = userId;
    this.mealService.tryUpdateMealsAvailability(this.order)
      .then(isSuccess => {
        if (!isSuccess) {
          return;
        }
        this.firestore.collection<Order>(ORDERS_COLLECTION)
          .add(this.order).then(docRef => {
          console.log(docRef)
          this.order.id = docRef.id
          return this.firestore.doc(ORDERS_COLLECTION + "/" + docRef.id)
            .update(this.order)
            .then(() => {
              this.orderHistory.push(this.order)
              const sentOrder = this.order;
              this.order = OrderService.createEmptyOrder()
              this.orderSubject.next(this.order)
              this.communicationService.publishMessage(`Złożono zamównienie ${sentOrder.id}`, MsgType.SUCCESS, 7000)
            })
        }).catch(error => {
          console.log(error)
          throw error
        })

      })
  }

  getUserOrdersByUserId(userId: string) {
    this.firestore.collection<Order>(ORDERS_COLLECTION, ref => ref.where('userId', '==', userId))
      .get()
      .pipe(map(data => {
        return data.docs.map(doc => doc.data());
      }))
      .subscribe(orders => {
        this.orderHistory = orders
        this.orderHistory.forEach(order => {
          // @ts-ignore
          const firebaseTimestamp = order.date as Timestamp;
          order.date = firebaseTimestamp.toDate()
        })
        this.publishOrderHistoryChanged();
      })
  }

  publishOrderHistoryChanged() {
    this.orderHistorySubject.next(JSON.parse(JSON.stringify(this.orderHistory)));
  }

  fetchOrderHistory() {
    this.publishOrderHistoryChanged()
  }
}
