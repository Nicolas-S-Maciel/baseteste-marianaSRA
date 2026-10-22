package com.senai.mariana.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Rotas das páginas Thymeleaf (src/main/resources/templates); os dados vêm da API via JS
@Configuration
public class PaginasConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/relatorio").setViewName("relatorio");
    }
}
