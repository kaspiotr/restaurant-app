import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meal} from "../model/dish.model";
import {MealService} from "../services/meal.service";
import {MealViewModel} from "./view-model/meal.viewmodel";
import {FilterValue} from "../pipes/filter-value";
import {OrderService} from "../services/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {Pagination} from "../pagination/pagination.component";

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit, OnDestroy {
  data: string = "";
  meals: MealViewModel[] = []

  much = Availability.MUCH
  notMuch = Availability.NOT_MUCH
  little = Availability.LITTLE
  filterValue: FilterValue = new FilterValue();
  basketCount: number = 0;
  minPrice: number = 0;
  maxPrice: number = 0;

  private _mealsSubscription: Subscription | null = null
  private _orderSubscription: Subscription | null = null;
  pagination: Pagination = {page: 1, count: 10};

  constructor(private mealService: MealService,
              private orderService: OrderService,
              private router: Router,
              private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.subscribeToMeals();
    this.fetchMeals();
    this.subscribeToOrderCount();
    this.fetchOrdersCount();
  }

  ngOnDestroy(): void {
    if (this._mealsSubscription) {
      this._mealsSubscription.unsubscribe();
      this._orderSubscription!.unsubscribe()
    }
  }

  private subscribeToMeals() {
    this._mealsSubscription = this.mealService.getMeals().subscribe((meals: Meal[]) => {
      this.meals = meals.map(meal => MealViewModel.toViewModel(meal))
      this.minPrice = Math.min(...this.meals.map(meal => meal.price.value), Number.MAX_VALUE)
      this.maxPrice = Math.max(0, ...this.meals.map(meal => meal.price.value))
    })
  }

  stringify(meal: Meal): string {
    return JSON.stringify(meal)
  }

  getAvailability(meal: MealViewModel): Availability {
    if (meal.available > 5) return Availability.MUCH
    if (meal.available > 3) return Availability.NOT_MUCH
    else return Availability.LITTLE
  }

  onFilterValueChanged(filterValue: FilterValue) {
    console.log("FilterValue:")
    console.log(filterValue)
    this.filterValue = filterValue
  }

  private subscribeToOrderCount() {
    this._orderSubscription = this.orderService.getOrderCount().subscribe(count => {
      this.basketCount = count
    })
  }

  goToBasket() {
    this.router.navigate(['basket']);
  }

  private fetchMeals() {
    this.mealService.fetchMeals();
  }

  private fetchOrdersCount() {
    this.orderService.fetchOrdersCount()
  }

  details(meal: MealViewModel) {
    this.router.navigate(['./', meal.id], {relativeTo: this.route});
  }

  isCheapest(meal: MealViewModel): boolean {
    return this.minPrice == meal.price.value
  }

  isMostExpensive(meal: MealViewModel): boolean {
    return this.maxPrice == meal.price.value
  }

  onPaginationChange(pagination: Pagination) {
    console.log("pagination change")
    console.log(pagination);
    this.pagination = pagination
  }
}

enum Availability {
  MUCH, NOT_MUCH, LITTLE
}
