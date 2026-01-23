package com.recipe_service.demo.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        String dbUrl = System.getenv("DATABASE_URL");
        
        if (dbUrl != null && dbUrl.startsWith("postgresql://")) {
            dbUrl = "jdbc:" + dbUrl;
        }
        
        return DataSourceBuilder.create()
            .url(dbUrl)
            .build();
    }
}
