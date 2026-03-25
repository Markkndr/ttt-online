package com.codecool.tttbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TttBackendApplication {

    static void main(String[] args) {
        SpringApplication.run(TttBackendApplication.class, args);
    }

}
