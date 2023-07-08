package com.hoangle.ecommerce.service;

import com.hoangle.ecommerce.dto.PaymentInfo;
import com.hoangle.ecommerce.dto.Purchase;
import com.hoangle.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;

}
