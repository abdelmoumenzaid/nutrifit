package com.recipe_service.demo.translation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
public class TranslationDataInitializer implements CommandLineRunner {

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🚀 Translation data loaded from Flyway migration");
    }
}