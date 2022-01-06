import {Component, EventEmitter, OnDestroy, OnInit, Output,} from '@angular/core';
import {FilterValue} from "../pipes/filter-value";
import {MealService} from "../services/meal.service";
import {Subscription} from "rxjs";
import {MatSliderChange} from "@angular/material/slider";
import {SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-filter-meals',
  templateUrl: './filter-meals.component.html',
  styleUrls: ['./filter-meals.component.scss']
})
export class FilterMealsComponent implements OnInit, OnDestroy {
  @Output("onFilterValueChanged") onFilterValueChanged: EventEmitter<FilterValue> = new EventEmitter<FilterValue>()

  filterValue: FilterValue | null = null
  cuisine: string;
  cuisines: string[] = [];
  types: string[] = [];
  ratings: string[] = [];
  prices: string[] = [];
  private _mealServiceSubscription: Subscription | null = null;
  private _settingsSubscription: Subscription | null = null;
  minPrice: number = 0;
  maxPrice: number = Number.MAX_VALUE;
  minSliderPrice: number = 0;
  maxSliderPrice: number = 0;
  currencySymbol = "$";
  name = "";

  constructor(private mealService: MealService, private settingsService: SettingsService) {
    this.cuisine = ""
    this.filterValue = new FilterValue();
    this.currencySymbol = this.settingsService.getCurrentCurrencySymbol()
  }

  ngOnInit(): void {
    this._mealServiceSubscription = this.mealService.getMeals().subscribe(meals => {
      console.log("FILTER MEALS SUBSCRIPTION")
      const cuisines = meals.map(meal => meal.cuisine.toLowerCase())
      const sortedCuisines = FilterMealsComponent.distinctSorted(cuisines);
      this.cuisines = sortedCuisines as string[]

      const types = meals.map(meal => meal.type.toLowerCase())
      const sortedTypes = FilterMealsComponent.distinctSorted(types);
      this.types = sortedTypes as string[]

      const ratings = meals.map(meal => meal.rating.toString())
      const sortedRatings = FilterMealsComponent.distinctSorted(ratings);
      this.ratings = sortedRatings as string[]

      const prices = meals.map(meal => meal.price.value)
      this.minPrice = Math.min(...prices)
      this.maxPrice = Math.max(...prices)

      this.minSliderPrice = this.minPrice
      this.maxSliderPrice = this.maxPrice
    })

    this.mealService.fetchMeals()

    this._settingsSubscription = this.settingsService.settingsChangeSubject
      .subscribe(() => this.currencySymbol = this.settingsService.getCurrentCurrencySymbol())
  }

  private static distinctSorted(values: string[]) {
    return [...new Set(values)].sort();
  }

  ngOnDestroy(): void {
    if (this._mealServiceSubscription) {
      console.log("tearing down subscriptions")
      this._mealServiceSubscription.unsubscribe();
      this._settingsSubscription!.unsubscribe();
    }
  }

  emitFilterValueChange() {
    const copy = JSON.parse(JSON.stringify(this.filterValue))
    this.onFilterValueChanged.emit(copy);
  }

  onSelectedCuisinesChanged(cuisines: string[]) {
    this.filterValue!.cuisines = cuisines
    this.emitFilterValueChange()
  }

  onSelectedTypesChanged(types: string[]) {
    this.filterValue!.types = types
    this.emitFilterValueChange()
  }

  onSelectedRatingsChanged(ratings: string[]) {
    this.filterValue!.ratings = ratings
    this.emitFilterValueChange()
  }

  formatPriceSliderLabel(price: number) {
    return Math.round((price + Number.EPSILON) * 100) / 100;
  }

  onMinSliderPriceChange(event: MatSliderChange) {
    this.filterValue!.minPrice = event.value as number
    this.emitFilterValueChange()
  }

  onMaxSliderPriceChange(event: MatSliderChange) {
    this.filterValue!.maxPrice = event.value as number
    this.emitFilterValueChange()
  }

  onNameChanged(name: string) {
    this.filterValue!.name = name;
    this.emitFilterValueChange();
  }
}
