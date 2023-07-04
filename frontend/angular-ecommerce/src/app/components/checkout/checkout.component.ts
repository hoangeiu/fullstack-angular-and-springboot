import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { ShopFormService } from 'src/app/services/shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  months: number[] = [];
  years: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private shopFormService: ShopFormService
  ) {}

  ngOnInit(): void {
    // build up form
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // get months & years
    const startMonth: number = new Date().getMonth() + 1;
    this.shopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.months = data));
    this.shopFormService
      .getCreditCardYears()
      .subscribe((data) => (this.years = data));

    // get totalPrice and totalQuantity
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    this.cartService.computeCartTotals();

    // populate contries
    this.shopFormService.getCountries().subscribe((data) => {
      this.countries = data;
    });
  }

  onSubmit() {
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }

  copyShippingToBilling(event: any) {
    if (event.target.checked) {
      this.billingAddressStates = this.shippingAddressStates;
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const currentYear: number = new Date().getFullYear();
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const selectedYear: number = +creditCardFormGroup?.value.expirationYear;

    const startMonth =
      currentYear === selectedYear ? new Date().getMonth() + 1 : 1;
    this.shopFormService.getCreditCardMonths(startMonth).subscribe((data) => {
      this.months = data;
      creditCardFormGroup?.patchValue({ expirationMonth: startMonth });
    });
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;

    this.shopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      formGroup?.get('state')?.setValue(data[0]);
    });
  }
}
