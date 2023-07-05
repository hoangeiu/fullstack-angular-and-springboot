package com.hoangle.ecommerce.dto;

import com.hoangle.ecommerce.entity.Address;
import com.hoangle.ecommerce.entity.Customer;
import com.hoangle.ecommerce.entity.Order;
import com.hoangle.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.List;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private List<OrderItem> orderItems;

}
