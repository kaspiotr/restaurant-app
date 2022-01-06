import {Injectable} from '@angular/core';
import {Meal} from "../model/dish.model";
import {Observable, Subject} from "rxjs";
import {map} from "rxjs/operators";
import {SettingsService} from "./settings.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {CommunicationService, MsgType} from "./communication.service";
import {Order} from "../model/order.model";

const MEALS_COLLECTION = 'meals';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private dishes: Meal[] = [];
  private dishesSubject = new Subject<Meal[]>();


  constructor(private firestore: AngularFirestore,
              private settingsService: SettingsService,
              private communicationService: CommunicationService,
  ) {
    this.firestore.collection<Meal>(MEALS_COLLECTION)
      .get()
      .subscribe(documentChangeAction => {
        this.dishes = documentChangeAction.docs.map(meal => meal.data())
        console.log("firebase dishes fetching");
        this.sortDishesNameAsc();
        this.dishesSubject.next(this.dishes)
      });
    this.settingsService.settingsChangeSubject.subscribe(() => {
      this.dishes = this.dishes.map(dish => this.changeCurrency(dish))
      this.publishMealsChange();
    })
  }

  public getMeals(): Observable<Meal[]> {
    return this.dishesSubject;
  }

  addMeal(meal: Meal): Promise<string> {
    this.sortDishesNameAsc()
    return this.firestore.collection(MEALS_COLLECTION)
      .add(meal)
      .then(docRef => {
        meal.id = docRef.id
        return this.firestore.doc(MEALS_COLLECTION + "/" + docRef.id)
          .update(meal)
          .then(() => {
            this.dishes.push(meal);
            this.publishMealsChange();
            this.communicationService.publishMessage(`Dodano potrawę ${meal.name} (${meal.id})`, MsgType.SUCCESS, 4000)
            return "OK 201";
          })
      })
  }

  editMeal(meal: Meal): Promise<string> {
    this.sortDishesNameAsc()
    return this.firestore.doc(MEALS_COLLECTION + "/" + meal.id)
      .update(meal)
      .then(() => {
        const editedIdx = this.dishes.findIndex(meal => meal.id === meal.id)
        this.dishes.splice(editedIdx, 1, meal);
        this.publishMealsChange();
        this.communicationService.publishMessage(`Edytowano potrawę ${meal.name} (${meal.id})`, MsgType.SUCCESS, 4000)
        return "OK 204"
      });
  }

  updateRating(mealId: string, rating: number): Promise<string> {
    let oldMeal: Meal = this.dishes.find(meal => meal.id === mealId)!;
    oldMeal.rating = rating
    this.publishMealsChange()
    return this.firestore.doc(MEALS_COLLECTION + "/" + oldMeal.id).update(oldMeal)
      .then(() => "OK 200");
  }

  private sortDishesNameAsc() {
    this.dishes = this.dishes.sort((dishA, dishB) => dishA.name.localeCompare(dishB.name))
  }

  deleteMeal(mealId: string) {
    const mealToDeleteIdx = this.dishes.findIndex(meal => meal.id == mealId)
    const deletedMeal = this.dishes.filter(meal => meal.id == mealId)[0]
    this.dishes.splice(mealToDeleteIdx, 1)
    return this.firestore.doc(MEALS_COLLECTION + "/" + mealId)
      .delete()
      .then(() => {
        this.publishMealsChange()
        return deletedMeal
      })
  }

  fetchMeals() {
    this.publishMealsChange();
  }

  private publishMealsChange() {
    this.dishesSubject.next(MealService.deepCopy(this.dishes))
  }

  private static deepCopy<T>(original: T): T {
    return JSON.parse(JSON.stringify(original))
  }

  getMeal(mealId: string): Observable<Meal | null> {
    return this.getMeals()
      .pipe(
        map(meals => meals.filter(meal => meal.id === mealId)),
        map(meals => meals.length > 0 ? meals[0] : null)
      )
  }

  private changeCurrency(meal: Meal): Meal {
    const currencySymbol = this.settingsService.getCurrentCurrencySymbol()
    let newPrice = meal.price
    if (currencySymbol != meal.price.currency) {
      const value = meal.price.value / this.settingsService.getRateForCurrency(meal.price.currency) * this.settingsService.getRate()
      newPrice = {currency: this.settingsService.getCurrentCurrencySymbol(), value: value}
    }
    meal.price = newPrice
    return meal;
  }

  tryUpdateMealsAvailability(order: Order): Promise<boolean> {
    const mealIds = order.details.map(det => det.id);
    return this.firestore.collection<Meal>(MEALS_COLLECTION, ref => ref.where('id', 'in', mealIds))
      .get()
      .pipe(map(snapshot => snapshot.docs.map(doc => doc.data())))
      .toPromise()
      .then((serverMeals: Meal[]) => {
        if (serverMeals.findIndex(meal => this.isNotAvailableInOrderAmount(meal, order)) !== -1) {
          this.communicationService.publishMessage('Przepraszamy, za mało dostępnych porcji dla co najmniej jednej potrawy', MsgType.ERROR, 5000);
          return false;
        }
        // tu jest juz ok
        serverMeals.forEach(serverMeal => {
          serverMeal.available -= order.details.find(det => det.id == serverMeal.id)!.amount;
          serverMeal.dayLimit -= order.details.find(det => det.id == serverMeal.id)!.amount;

          const cachedMeal = this.dishes.find(meal => meal.id === serverMeal.id)
          if (cachedMeal) {
            cachedMeal.available = serverMeal.available;
            cachedMeal.dayLimit = serverMeal.dayLimit;
          }
        })

        const promises = serverMeals.map(meal => {
          return this.firestore.doc(MEALS_COLLECTION + "/" + meal.id)
            .update(meal)
            .then(() => "OK 201")
        })
        return Promise.all(promises).then(() => {
          this.publishMealsChange();
          return true
        });
      });
  }

  private isNotAvailableInOrderAmount(meal: Meal, order: Order) {
    return meal.available < order.details.find(det => det.id == meal.id)!.amount;
  }
}
