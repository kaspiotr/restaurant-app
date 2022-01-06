import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settingsChangeSubject = new Subject<void>();

  selectedCurrency = Currency.DOLLAR

  currencyRates = new Map<Currency, number>()
    .set(Currency.DOLLAR, 1)
    .set(Currency.POUND, 1.35)

  currencySymbols = new Map<Currency, string>()
    .set(Currency.DOLLAR, "$")
    .set(Currency.POUND, "£")

  symbolToCurrency = new Map<string, Currency>()
    .set("$", Currency.DOLLAR)
    .set("£", Currency.POUND)

  constructor() {
  }

  getCurrentCurrencySymbol(): string {
    return this.currencySymbols.get(this.selectedCurrency)!;
  }

  getSymbolForCurrency(currency: Currency): string {
    return this.currencySymbols.get(currency)!;
  }

  getRate(): number {
    return this.currencyRates.get(this.selectedCurrency)!;
  }

  changeCurrency(currency: Currency) {
    this.selectedCurrency = currency
    this.settingsChangeSubject.next();
  }

  getRateForCurrency(symbol: string): number {
    const currency = this.symbolToCurrency.get(symbol)!
    return this.currencyRates.get(currency)!
  }
}

export enum Currency {
  DOLLAR, POUND
}
