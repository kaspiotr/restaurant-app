import {Component, Input, OnInit} from '@angular/core';
import {MealViewModel} from "../meals/view-model/meal.viewmodel";

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @Input('meal') meal: MealViewModel | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  nextImg(meal: MealViewModel) {
    meal.currentImgIdx = (meal.currentImgIdx + 1) % meal.imgUrls.length
  }

  prevImg(meal: MealViewModel) {
    meal.currentImgIdx = meal.currentImgIdx - 1 >= 0 ? meal.currentImgIdx - 1 : meal.imgUrls.length - 1
  }
}
