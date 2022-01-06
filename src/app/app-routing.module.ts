import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MealsComponent} from "./meals/meals.component";
import {BasketComponent} from "./basket/basket.component";
import {StartingPageComponent} from "./starting-page/starting-page.component";
import {MealDetailsComponent} from "./meal-details/meal-details.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {SignInComponent} from "./auth/sign-in/sign-in.component";
import {RegisterUserComponent} from "./auth/register-user/register-user.component";
import {AuthGuard} from "./guard/auth.guard";
import {ManageMealsComponent} from "./manage-meals/manage-meals.component";
import {AdminGuard} from "./guard/admin.guard";
import {OrderHistoryComponent} from "./order-history/order-history.component";

const routes: Routes = [
  {path: '', component: StartingPageComponent},
  {path: 'login', component: SignInComponent},
  {path: 'register', component: RegisterUserComponent},
  {path: 'menu', component: MealsComponent, canActivate: [AuthGuard]},
  {path: 'menu/:id', component: MealDetailsComponent, canActivate: [AuthGuard]},
  {path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard]},
  {path: 'basket', component: BasketComponent, canActivate: [AuthGuard]},
  {path: 'manage-meals', component: ManageMealsComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
