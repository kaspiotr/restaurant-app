import {Ingredient, Meal, Price} from "../../model/dish.model";

export class MealViewModel implements Meal {
  id: string;
  category: string;
  cuisine: string;
  dayLimit: number;
  description: string;
  available: number
  imgUrls: string[];
  ingredients: Ingredient[];
  name: string;
  price: Price;
  type: string;
  rating: number;

  // view specific
  currentImgIdx = 0
  toOrderCount = 0

  constructor(id: string, category: string, cuisine: string, dayLimit: number, description: string, available: number, imgUrls: string[], ingredients: Ingredient[], name: string, price: Price, type: string, rating: number) {
    this.id = id;
    this.category = category;
    this.cuisine = cuisine;
    this.dayLimit = dayLimit;
    this.available = available;
    this.description = description;
    this.imgUrls = imgUrls;
    this.ingredients = ingredients;
    this.name = name;
    this.price = price;
    this.type = type;
    this.rating = rating;
    // view specific
    this.currentImgIdx = this.imgUrls.length > 1 ? 1 : 0
    this.toOrderCount = 0
  }

  static toViewModel(meal: Meal): MealViewModel {
    return new MealViewModel(
      meal.id,
      meal.category,
      meal.cuisine,
      meal.dayLimit,
      meal.description,
      meal.available,
      meal.imgUrls,
      meal.ingredients,
      meal.name,
      meal.price,
      meal.type,
      meal.rating
    );
  }
}
