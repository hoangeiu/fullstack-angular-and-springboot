import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
// import { Order } from 'src/app/common/order';
// import { OrderItem } from 'src/app/common/order-item';
// import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CommonValidators } from 'src/app/validators/common-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  isDisabled: boolean = false;

  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = localStorage;

  // initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private shopFormService: ShopFormService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CommonValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        // cardType: new FormControl('', [Validators.required]),
        // nameOnCard: new FormControl('', [
        //   Validators.required,
        //   Validators.minLength(2),
        //   CommonValidators.notOnlyWhitespace,
        // ]),
        // cardNumber: new FormControl('4242424242424242', [
        //   Validators.required,
        //   Validators.pattern('[0-9]{16}'),
        // ]),
        // securityCode: new FormControl('567', [
        //   Validators.required,
        //   Validators.pattern('[0-9]{3}'),
        // ]),
        // expirationMonth: new FormControl('', [Validators.required]),
        // expirationYear: new FormControl('', [Validators.required]),
      }),
    });

    this.setupStripePaymentForm();

    // const startMonth: number = new Date().getMonth() + 1;
    // this.shopFormService.getCreditCardMonths(startMonth).subscribe((data) => {
    //   this.creditCardMonths = data;
    //   this.checkoutFormGroup
    //     .get('creditCard')
    //     ?.get('expirationMonth')
    //     ?.setValue(data[0]);
    // });
    // this.shopFormService.getCreditCardYears().subscribe((data) => {
    //   this.creditCardYears = data;
    //   this.checkoutFormGroup
    //     .get('creditCard')
    //     ?.get('expirationYear')
    //     ?.setValue(data[1]);
    // });

    this.shopFormService
      .getCountries()
      .subscribe((data) => (this.countries = data));

    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));

    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );

    const userEmail = this.storage.getItem('userEmail');
    if (userEmail) {
      const theEmail = JSON.parse(userEmail);
      this.checkoutFormGroup.get('customer')?.get('email')?.setValue(theEmail);
    }
  }

  setupStripePaymentForm() {
    // get a handle to stripe elements
    let elements = this.stripe.elements();

    // Create a card element ... and hide the zip code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
  }

  onSubmit() {
    console.log('Submit');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    this.isDisabled = true;

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.getCartItems();

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map((item) => new OrderItem(item));

    // set up purchase
    let purchase = new Purchase();

    // popolate purcharse - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // popolate purcharse - shipping address
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // popolate purcharse - billing address
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // popolate purcharse - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'USD';

    if (this.displayError.textContent === '') {
      this.checkoutService
        .createPaymentIntent(this.paymentInfo)
        .subscribe((paymentIntentResponse) => {
          this.stripe
            .confirmCardPayment(
              paymentIntentResponse.client_secret,
              {
                payment_method: {
                  card: this.cardElement,
                  billing_details: {
                    email: purchase.customer.email,
                    name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                    address: {
                      line1: purchase.billingAddress.street,
                      city: purchase.billingAddress.city,
                      state: purchase.billingAddress.state,
                      postal_code: purchase.billingAddress.zipCode,
                      country: this.billingAddressCity?.value.code,
                    },
                  },
                },
              },
              { handleActions: false }
            )
            .then((result: any) => {
              if (result.error) {
                console.log(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response) => {
                    console.log(response);
                    this.resetCart();
                    this.isDisabled = true;
                  },
                  error: (error) => {
                    console.log(error);
                    this.isDisabled = false;
                  },
                });
              }
            });
        });
    }

    // call REST API
    // this.checkoutService.placeOrder(purchase).subscribe({
    //   next: (response) => {
    //     console.log(response);
    //     this.resetCart();
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   },
    // });
  }

  resetCart() {
    // rest cart data
    this.cartService.setCartItems([]);
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.computeCartTotals();

    // reset the form
    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');
  }

  copyShippingAddressToBillingAddress(event: Event) {
    if ((<HTMLInputElement>event.target).checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = +creditCardFormGroup?.value.expirationYear;

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;

    this.shopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else if (formGroupName === 'billingAddress') {
        this.billingAddressStates = data;
      }

      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }
}
