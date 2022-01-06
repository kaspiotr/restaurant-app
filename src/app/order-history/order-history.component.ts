import {Component, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from "../services/order.service";
import {Order} from "../model/order.model";
import {Subscription} from "rxjs";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  history: Order[] = [];
  private historySubscription: Subscription | null = null;

  constructor(private orderService: OrderService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.historySubscription = this.orderService.orderHistorySubject
      .subscribe(history => {
        this.history = history
      })

    this.orderService.fetchOrderHistory()
  }

  ngOnDestroy(): void {
    if (this.historySubscription) {
      this.historySubscription.unsubscribe()
    }
  }

  toJSON(historyEntry: Order) {
    return JSON.stringify(historyEntry)
  }

  getCost(historyEntry: Order): number {
    return historyEntry.details
      .map(detail => detail.price)
      .reduce((priceA, priceB) => priceA + priceB)
  }
}
