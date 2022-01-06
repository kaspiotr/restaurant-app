import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Rating, RatingService} from "../services/rating.service";
import {AuthService} from "../services/auth.service";
import {Meal} from "../model/dish.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit, OnDestroy {
  stars: number[] = Array(5).fill(1).map((_, idx) => idx + 1);
  @Input("meal") meal!: Meal;
  private userId: string = "";
  userRating: number = 0;
  private userRatingsSubscription: Subscription | null = null;

  constructor(private ratingService: RatingService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserData().user.id;
    this.userRatingsSubscription = this.ratingService.userRatingsSubject.subscribe(ratings => {
      this.userRating = ratings.find(rat => rat.mealId === this.meal.id)?.rating || 0;
    });
    this.ratingService.publishUserRatingsChanged();
  }

  ngOnDestroy(): void {
    if (this.userRatingsSubscription) {
      this.userRatingsSubscription.unsubscribe();
    }
  }

  markStarAt(starScore: number) {
    this.ratingService.addRating({
      id: "",
      userId: this.userId,
      mealId: this.meal.id,
      rating: starScore
    });
  }

  roundAvgRating(): number {
    return Math.round(this.meal.rating);
  }
}
