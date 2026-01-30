package com.recipe_service.demo.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    Optional<Translation> findByLanguageAndKey(Language language, String key);
    List<Translation> findByLanguageAndNamespace(Language language, String namespace);
    Optional<Translation> findByLanguageAndNamespaceAndKey(Language language, String namespace, String key);
}