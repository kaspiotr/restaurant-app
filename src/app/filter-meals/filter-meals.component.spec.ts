import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMealsComponent } from './filter-meals.component';

describe('FilterMealsComponent', () => {
  let component: FilterMealsComponent;
  let fixture: ComponentFixture<FilterMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterMealsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
