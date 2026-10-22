package com.senai.mariana.repository;

import com.senai.mariana.model.Registro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroRepository extends JpaRepository<Registro, Long> {
    List<Registro> findAllByOrderByDataDescHorarioDesc();
}

