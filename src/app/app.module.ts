import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {MealsComponent} from "./meals/meals.component";
import {UpsertMealComponent} from './add-meal/upsert-meal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RatingComponent} from './rating/rating.component';
import {MatIconModule} from "@angular/material/icon";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FilterMealsComponent} from './filter-meals/filter-meals.component';
import {SearchPipe} from './pipes/search.pipe';
import {BasketComponent} from './basket/basket.component';
import {SelectDropdownComponent} from './filter-meals/select-dropdown/select-dropdown.component';
import {MatSliderModule} from "@angular/material/slider";
import {MenuComponent} from './menu/menu.component';
import {StartingPageComponent} from './starting-page/starting-page.component';
import {MealDetailsComponent} from './meal-details/meal-details.component';
import {SliderComponent} from './slider/slider.component';
import {OrderMealComponent} from './order-meal/order-meal.component';
import {CurrencySwitchComponent} from './currency-switch/currency-switch.component';
import {ReviewComponent} from './review/review.component';
import {PaginationComponent} from './pagination/pagination.component';
import {SignInComponent} from './auth/sign-in/sign-in.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getFunctions, provideFunctions} from '@angular/fire/functions';
import {AuthService} from "./services/auth.service";
import {AngularFireModule} from "@angular/fire/compat";
import {RegisterUserComponent} from './auth/register-user/register-user.component';
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {ManageMealsComponent} from './manage-meals/manage-meals.component';
import {OrderHistoryComponent} from './order-history/order-history.component';
import {CommonModule} from "@angular/common";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import { CommunicationComponent } from './communication/communication.component';

@NgModule({
  declarations: [
    AppComponent,
    MealsComponent,
    UpsertMealComponent,
    RatingComponent,
    FilterMealsComponent,
    SearchPipe,
    BasketComponent,
    SelectDropdownComponent,
    MenuComponent,
    StartingPageComponent,
    MealDetailsComponent,
    SliderComponent,
    OrderMealComponent,
    CurrencySwitchComponent,
    ReviewComponent,
    PaginationComponent,
    SignInComponent,
    PageNotFoundComponent,
    RegisterUserComponent,
    ManageMealsComponent,
    OrderHistoryComponent,
    CommunicationComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    CommonModule,
    MatOptionModule,
    MatSelectModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
