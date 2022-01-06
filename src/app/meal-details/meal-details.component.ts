import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meal} from "../model/dish.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MealService} from "../services/meal.service";
import {MealViewModel} from "../meals/view-model/meal.viewmodel";
import {Subscription} from "rxjs";
import {Review, ReviewService} from "../services/review.service";

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.scss']
})
export class MealDetailsComponent implements OnInit, OnDestroy {

  meal: Meal | null = null;
  mealView: MealViewModel | null = null
  mealId = "";
  private _mealSubscription: Subscription | null = null
  mealReviews: Review[] = [];
  private mealReviewsSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mealService: MealService,
    private reviewService: ReviewService,
  ) {
  }

  ngOnInit(): void {
    this.mealId = this.route.snapshot.url.reduceRight((right, _) => right).path;
    this._mealSubscription = this.mealService.getMeal(this.mealId).subscribe(meal => {
      console.log(meal);
      this.meal = meal
      this.mealView = meal ? MealViewModel.toViewModel(meal) : null;
    })
    this.mealService.fetchMeals();
    this.subscribeToReviews();
    this.reviewService.getReviewsByMealId(this.mealId)
  }

  ngOnDestroy(): void {
    if (this.mealReviewsSubscription) {
      this.mealReviewsSubscription.unsubscribe();
    }
  }

  backToMenu() {
    this.router.navigate(['menu'])
  }

  subscribeToReviews() {
    console.log("new review for meal " + this.mealId)
    this.mealReviewsSubscription = this.reviewService.getReviewsSubscription()
      .subscribe(reviews => this.mealReviews = reviews)
    console.log(this.mealReviews)
  }

  stringify(value: any): string {
    return JSON.stringify(value)
  }
}
