import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root',
})
export class ShopFormService {
  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';

  constructor(private httpClient: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.httpClient
      .get<GetResponseCountries>(this.countriesUrl)
      .pipe(map((response) => response._embedded.countries));
  }

  getStates(countryCode: string): Observable<State[]> {
    const searchUrl = `${this.statesUrl}/search/findByCountryCode?code=${countryCode}`;

    return this.httpClient
      .get<GetResponseStates>(searchUrl)
      .pipe(map((response) => response._embedded.states));
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let months: number[] = [];

    for (let i = startMonth; i <= 12; i++) {
      months.push(i);
    }

    return of(months);
  }

  getCreditCardYears(): Observable<number[]> {
    let years: number[] = [];

    const startYear: number = new Date().getFullYear();
    for (let i = startYear; i <= startYear + 10; i++) {
      years.push(i);
    }

    return of(years);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  };
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  };
}
