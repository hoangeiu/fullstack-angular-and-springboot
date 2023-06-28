package com.hoangle.ecommerce.dao;

import com.hoangle.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Spring Data Rest automatically exposes endpoint http://localhost:8080/api/products/search/findByCategoryId?id=2
    Page<Product> findByCategoryId(@Param("id") Long id, Pageable pageable);
}
