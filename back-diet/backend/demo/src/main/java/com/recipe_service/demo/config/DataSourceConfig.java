package com.recipe_service.demo.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        
        // Si pas de DATABASE_URL (local), utilise la config normale
        if (url == null || !url.contains("postgres.railway.internal")) {
            return properties.initializeDataSourceBuilder().build();
        }
        
        // Railway DATABASE_URL
        try {
            URI dbUri = new URI(url.replace("postgresql://", ""));
            String host = dbUri.getHost();
            int port = dbUri.getPort();
            String path = dbUri.getPath();
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
            
            DriverManagerDataSource dataSource = new DriverManagerDataSource();
            dataSource.setUrl(jdbcUrl);
            dataSource.setUsername(username);
            dataSource.setPassword(password);
            dataSource.setDriverClassName("org.postgresql.Driver");
            
            return dataSource;
            
        } catch (URISyntaxException e) {
            throw new RuntimeException("Cannot parse DATABASE_URL: " + url, e);
        }
    }
}
