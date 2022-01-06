import {Pipe, PipeTransform} from '@angular/core';
import {MealViewModel} from "../meals/view-model/meal.viewmodel";
import {FilterValue} from "./filter-value";

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(meals: MealViewModel[], filterValue: FilterValue): MealViewModel[] {
    if (meals == null) {
      return [];
    }
    const cuisines = filterValue.cuisines
    const types = filterValue.types
    const ratings = filterValue.ratings
    const minPrice = parseFloat(filterValue.minPrice.toFixed(2))
    const maxPrice = parseFloat(filterValue.maxPrice.toFixed(2))

    return meals.filter(meal => {
      return (this.isFilterInactive(cuisines) ||
      cuisines.findIndex(cuisine => meal.cuisine.toLowerCase() === cuisine) !== -1)
        && (this.isFilterInactive(types) ||
        types.findIndex(type => meal.type.toLowerCase() === type) !== -1)
        && (this.isFilterInactive(ratings) ||
          ratings.findIndex(rating => meal.rating.toString() === rating) !== -1)
        && (meal.price.value >= minPrice && meal.price.value <= maxPrice)
      && (filterValue.name === "" || meal.name.toLocaleLowerCase().includes(filterValue.name.toLocaleLowerCase()))
    })
  }

  isFilterInactive(options: string[]) {
    return !options || options.length === 0;
  }
}
