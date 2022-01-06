import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Review, ReviewService} from "../services/review.service";
import {CommunicationService, MsgType} from "../services/communication.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @Input("mealId") mealId: string = "";
  @Output("reviewAdded") reviewAdded = new EventEmitter<void>();

  reviewForm: FormGroup;
  minContent: number = 50;
  maxContent: number = 500;
  maxNick: number = 50;
  maxTitle: number = 200;
  reviews: Review[] = [];

  constructor(private reviewService: ReviewService,
              private communicationService: CommunicationService,
              private angularFireAuth: AngularFireAuth,) {
    this.reviewForm = new FormGroup({
      nick: new FormControl('', [Validators.required, Validators.maxLength(this.maxNick)]),
      title: new FormControl('', [Validators.required, Validators.maxLength(this.maxTitle)]),
      content: new FormControl('', [Validators.required, Validators.minLength(this.minContent), Validators.maxLength(this.maxContent)]),
      buyDate: new FormControl('', [])
    })
  }

  ngOnInit(): void {
    this.subscribeToReviews()
    this.reviewService.fetchReviews();
  }

  private subscribeToReviews() {
    this.reviewService.getReviewsSubscription()
      .subscribe(reviews => this.reviews = reviews)
  }

  nickForm(): FormControl {
    return this.reviewForm.get("nick") as FormControl
  }

  titleForm(): FormControl {
    return this.reviewForm.get("title") as FormControl
  }

  contentForm(): FormControl {
    return this.reviewForm.get("content") as FormControl
  }

  private buyDateForm(): FormControl {
    return this.reviewForm.get("buyDate") as FormControl
  }

  stringify(obj: any) {
    return JSON.stringify(obj);
  }

  sendReview() {
    this.angularFireAuth.onAuthStateChanged(user => {
      if (user) {
        const review: Review = {
          id: "",
          mealId: this.mealId,
          nick: this.nickForm().value as string,
          title: this.titleForm().value as string,
          content: this.contentForm().value,
          date: this.buyDateForm().value as Date,
          userId: user.uid
        }
        this.reviewService.addReview(review)
          .then(maybeReview => {
            if (maybeReview) {
              this.reviewAdded.emit();
              this.communicationService.publishMessage(`Wysłano recenzję`, MsgType.SUCCESS, 5000)
            }
          })
      }
    });
  }
}
