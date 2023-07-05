package com.hoangle.ecommerce.service;

import com.hoangle.ecommerce.dto.Purchase;
import com.hoangle.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
