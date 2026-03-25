package com.codecool.tttbackend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@SpringBootConfiguration
public class Configuration {

    @Value("${tttonline.database.url}")
    private String dataBaseUrl;

    @Value("${tttonline.database.username}")
    private String dataBaseUsername;

    @Value("${tttonline.database.password}")
    private String dataBasePassword;

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(dataBaseUrl);
        dataSource.setUsername(dataBaseUsername);
        dataSource.setPassword(dataBasePassword);
        return dataSource;
    }
}
