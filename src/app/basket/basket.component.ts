import {Component, OnInit} from '@angular/core';
import {Order, OrderDetail} from "../model/order.model";
import {OrderService} from "../services/order.service";
import {Router} from "@angular/router";
import {SettingsService} from "../services/settings.service";
import {Subscription} from "rxjs";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {CommunicationService, MsgType} from "../services/communication.service";

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {
  order: Order = {
    details: [],
    date: new Date(),
    id: "",
    userId: ""
  };

  private _settingsSubscription: Subscription | null = null
  currencySymbol: string = "";

  constructor(private orderService: OrderService,
              private settingsService: SettingsService,
              private router: Router,
              private angularFireAuth: AngularFireAuth,
              private communicationService: CommunicationService) {
  }

  ngOnInit(): void {
    this.subscribeToOrders();
    this.getOrders()
    this._settingsSubscription = this.settingsService.settingsChangeSubject
      .subscribe(() => this.currencySymbol = this.settingsService.getCurrentCurrencySymbol())
  }

  private subscribeToOrders() {
    this.orderService.getOrderSubscription()
      .subscribe(order => this.order = order)
  }

  private getOrders() {
    this.orderService.fetchOrders();
  }

  getTotalCost(): number {
    return this.order.details
      .map(detail => detail.amount * detail.price)
      .reduce((costA, costB) => costA + costB, 0)
  }

  more(detail: OrderDetail) {
    this.orderService.addToOrder(detail.id, detail.name, 1, detail.price)
  }

  less(detail: OrderDetail) {
    this.orderService.addToOrder(detail.id, detail.name, -1, detail.price)
  }


  getCost(detail: OrderDetail) {
    return (detail.price * detail.amount).toFixed(2)
  }

  goToMainMenu() {
    this.router.navigate(['menu'])
  }

  sendOrder() {
    const orderService = this.orderService;
    this.angularFireAuth.onAuthStateChanged(user => {
      if (user) {
        orderService.submitOrder(user.uid)
      }
    });
  }
}
