import {Component, OnInit} from '@angular/core';
import {MealService} from "../services/meal.service";
import {MealViewModel} from "../meals/view-model/meal.viewmodel";
import {OrderService} from "../services/order.service";
import {FilterValue} from "../pipes/filter-value";
import {CommunicationService, MsgType} from "../services/communication.service";

@Component({
  selector: 'app-manage-meals',
  templateUrl: './manage-meals.component.html',
  styleUrls: ['./manage-meals.component.scss']
})
export class ManageMealsComponent implements OnInit {
  meals: MealViewModel[] = [];
  filter: FilterValue = new FilterValue();

  constructor(private mealService: MealService,
              private orderService: OrderService,
              private communicationService: CommunicationService) {
  }

  ngOnInit(): void {
    this.mealService.getMeals().subscribe(meals => {
      this.meals = meals.map(ml => MealViewModel.toViewModel(ml));
    })
    this.mealService.fetchMeals();
  }

  deleteMeal(meal: MealViewModel) {
    this.orderService.deleteFromOrder(meal.id);
    this.mealService.deleteMeal(meal.id).then(deletedMeal => {
      this.communicationService.publishMessage(`Usunięto danie ${deletedMeal.name}`, MsgType.SUCCESS, 5000)
    })
  }

  updateFilter(filterValue: FilterValue) {
    this.filter = filterValue
  }

  cancelEdit() {
    this.mealService.fetchMeals();
    this.communicationService.publishMessage(`Cofnięto zmiany we wszsytkich formularzach`, MsgType.SUCCESS, 5000)
  }
}
