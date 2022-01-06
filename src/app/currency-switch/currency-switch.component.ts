import {Component, OnInit} from '@angular/core';
import {Currency, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-currency-switch',
  templateUrl: './currency-switch.component.html',
  styleUrls: ['./currency-switch.component.scss']
})
export class CurrencySwitchComponent implements OnInit {
  currencies: Currency[] = [Currency.DOLLAR, Currency.POUND];

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
  }

  getCurrencySymbol(currency: Currency): string {
    return this.settingsService.getSymbolForCurrency(currency);
  }

  changeCurrency(currency: Currency): void {
    this.settingsService.changeCurrency(currency);
  }
}
