package com.hoangle.ecommerce.dao;

import com.hoangle.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
public interface ProductRepository extends JpaRepository<Product, Long> {
}
