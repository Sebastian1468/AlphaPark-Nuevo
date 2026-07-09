package com.alphapark.repository;

import com.alphapark.model.ParqueoConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParqueoConfigRepository extends JpaRepository<ParqueoConfig, Integer> {

    Optional<ParqueoConfig> findFirstByOrderByIdConfigAsc();
}
