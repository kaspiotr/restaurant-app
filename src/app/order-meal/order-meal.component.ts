import {Component, Input, OnInit} from '@angular/core';
import {MealViewModel} from "../meals/view-model/meal.viewmodel";
import {OrderService} from "../services/order.service";
import {CommunicationService, MsgType} from "../services/communication.service";

@Component({
  selector: 'app-order-meal',
  templateUrl: './order-meal.component.html',
  styleUrls: ['./order-meal.component.scss']
})
export class OrderMealComponent implements OnInit {

  @Input("mealView") mealView: MealViewModel | null = null;
  @Input("minPrice") minPrice = 0
  @Input("maxPrice") maxPrice = 0

  constructor(private orderService: OrderService, private communicationService: CommunicationService) {
  }

  ngOnInit(): void {
    console.log(`PRICES: ${this.minPrice} - ${this.mealView?.price.value} - ${this.maxPrice}`)
  }

  isCheapest(meal: MealViewModel): boolean {
    return this.minPrice == meal.price.value
  }

  isMostExpensive(meal: MealViewModel): boolean {
    return this.maxPrice == meal.price.value
  }

  addToBasket(meal: MealViewModel) {
    this.orderService.addToOrder(meal.id, meal.name, meal.toOrderCount, meal.price.value)
    // meal.available = meal.available - meal.toOrderCount
    meal.toOrderCount = 0
    this.communicationService.publishMessage(`Dodano ${meal.name} do koszyka`, MsgType.SUCCESS)
  }

  incrementOrders(meal: MealViewModel) {
    meal.toOrderCount++
  }

  decrementOrders(meal: MealViewModel) {
    meal.toOrderCount--
    meal.toOrderCount = meal.toOrderCount < 0 ? 0 : meal.toOrderCount
  }

  isNotInBasket(): boolean {
    return !this.orderService.isInBasket(this.mealView!.id)
  }

  getBasketCount(): number {
    return this.orderService.getMealInBasketCount(this.mealView!.id)
  }

  removeFromBasket() {
    return this.orderService.deleteFromOrder(this.mealView!.id);
  }
}
