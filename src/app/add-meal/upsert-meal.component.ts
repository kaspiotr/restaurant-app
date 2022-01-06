import {Component, Input, OnInit} from '@angular/core';
import {Ingredient, Meal} from "../model/dish.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MealService} from "../services/meal.service";
import {SettingsService} from "../services/settings.service";
import {MealViewModel} from "../meals/view-model/meal.viewmodel";

@Component({
  selector: 'app-upsert-meal',
  templateUrl: './upsert-meal.component.html',
  styleUrls: ['./upsert-meal.component.scss']
})
export class UpsertMealComponent implements OnInit {

  @Input('mealToEdit') mealToEdit: MealViewModel | null = null;

  ingredientNameToAdd: string = "";
  imgUrlToAdd: string = "";

  images: string[] = [];
  ingredients: Ingredient[] = [];

  mealForm: FormGroup;
  upsertButtonLabel = "dodaj potrawę";
  defaultMaxLength = 50;

  minDescription = 50;
  maxDescription = 500;

  minAvailable = 10;
  maxAvailable = 1000;

  constructor(private localDishesService: MealService, private settingsService: SettingsService) {
    this.mealForm = this.createMealForm()
  }

  private createMealForm() {
    return new FormGroup({
      category: new FormControl('', [Validators.required, Validators.maxLength(this.defaultMaxLength)]),
      cuisine: new FormControl('', [Validators.required, Validators.maxLength(this.defaultMaxLength)]),
      description: new FormControl('', [Validators.required, Validators.minLength(this.minDescription), Validators.maxLength(this.maxDescription)]),
      id: new FormControl(''),
      name: new FormControl('', [Validators.required, Validators.maxLength(this.defaultMaxLength)]),
      price: new FormControl('', [Validators.required, Validators.min(0.01)]),
      type: new FormControl('', [Validators.required, Validators.maxLength(this.defaultMaxLength)]),
      available: new FormControl('', [Validators.required, Validators.min(this.minAvailable), Validators.max(this.maxAvailable)]),
    });
  }

  ngOnInit(): void {
    if (this.mealToEdit) {
      this.mealForm.controls["id"].setValue(this.mealToEdit.id);
      this.mealForm.controls["category"].setValue(this.mealToEdit.category);
      this.mealForm.controls["cuisine"].setValue(this.mealToEdit.cuisine);
      this.mealForm.controls["description"].setValue(this.mealToEdit.description);
      this.images.push(...this.mealToEdit.imgUrls);
      this.ingredients.push(...this.mealToEdit.ingredients);
      this.mealForm.controls["name"].setValue(this.mealToEdit.name);
      this.mealForm.controls["price"].setValue(this.mealToEdit.price.value);
      this.mealForm.controls["type"].setValue(this.mealToEdit.type);
      this.mealForm.controls["available"].setValue(this.mealToEdit.available);

      this.upsertButtonLabel = "edytuj potrawę";
    }
  }


  addIngredient() {
    this.ingredients.push({
      name: this.ingredientNameToAdd
    })
    this.ingredientNameToAdd = "";
  }

  addImgUrl() {
    this.images.push(this.imgUrlToAdd)
    this.imgUrlToAdd = "";
  }

  onSubmit() {
    const meal: Meal = {
      id: this.mealToEdit?.id ? this.mealToEdit.id : "",
      category: this.getControlValue("category"),
      cuisine: this.getControlValue("cuisine"),
      dayLimit: this.getControlIntValue("available"),
      description: this.getControlValue("description"),
      available: this.getControlIntValue("available"),
      imgUrls: this.images,
      ingredients: this.ingredients,
      name: this.getControlValue("name"),
      price: {value: this.getControlIntValue("price"), currency: this.settingsService.getCurrentCurrencySymbol()},
      type: this.getControlValue("type"),
      rating: 0
    }

    if (meal.id !== "") {
      this.localDishesService.editMeal(meal).then()
    } else {
      this.localDishesService.addMeal(meal).then(() => {
        this.mealForm = this.createMealForm();
      })
    }
  }

  getControlValue(name: string): string {
    return this.mealForm.controls[name].value
  }

  getControlIntValue(name: string): number {
    return this.mealForm.controls[name].value
  }

  getErrorMessages(): any[] {
    const controlNames = ["category", "cuisine", "dayLimit", "description", "available", "name", "price", "type"]
    const errorCodes = ['required', 'minLength', 'maxLength', 'min', 'max']

    return controlNames
      .map(controlName => errorCodes.filter(errorCode => this.mealForm.get(controlName)?.getError(errorCode) != null))
  }

  deleteImg(imgIdx: number) {
    this.images.splice(imgIdx, 1);
  }

  deleteIngredient(ingredientIdx: number) {
    this.ingredients.splice(ingredientIdx, 1);
  }

  getCurrentCurrency() {
    return this.settingsService.getCurrentCurrencySymbol();
  }

  getForm(formControlName: string): FormControl {
    return this.mealForm.get(formControlName) as FormControl;
  }
}
