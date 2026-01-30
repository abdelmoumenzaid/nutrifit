package com.recipe_service.demo.translation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranslationService {

    private final TranslationRepository translationRepository;
    private final LanguageRepository languageRepository;

    @Cacheable("languages")
    public List<Language> getActiveLanguages() {
        log.info("📥 Fetching active languages");
        List<Language> languages = languageRepository.findByActiveOrderBySortOrderAsc(true);
        log.info("✓ Found {} active languages", languages.size());
        return languages;
    }

    @Cacheable(value = "translations", key = "#lang + '_' + #namespace")
    public Map<String, String> getNamespaceTranslations(String lang, String namespace) {
        log.info("📥 Fetching translations for {}/{}", lang, namespace);
        
        Language language = languageRepository.findByCode(lang)
            .orElseThrow(() -> new IllegalArgumentException("Langue non trouvée: " + lang));
        
        List<Translation> translations = translationRepository.findByLanguageAndNamespace(language, namespace);
        
        Map<String, String> result = translations.stream()
            .collect(Collectors.toMap(Translation::getKey, Translation::getValue));
        
        log.info("✓ Found {} translations for {}/{}", result.size(), lang, namespace);
        return result;
    }

    public String getTranslation(String lang, String key) {
        log.info("📥 Fetching translation {}/{}", lang, key);
        
        Language language = languageRepository.findByCode(lang)
            .orElseThrow(() -> new IllegalArgumentException("Langue non trouvée: " + lang));
        
        Optional<Translation> translation = translationRepository.findByLanguageAndKey(language, key);
        
        if (translation.isPresent()) {
            log.info("✓ Translation found: {} = {}", key, translation.get().getValue());
            return translation.get().getValue();
        }
        
        log.warn("⚠️ Translation not found for key: {}", key);
        return key;
    }

    @Transactional
    @CacheEvict(value = "translations", allEntries = true)
    public Translation saveTranslation(String langCode, String namespace, String key, String value) {
        log.info("📤 Saving translation {}/{} = {}", langCode, key, value);
        
        Language language = languageRepository.findByCode(langCode)
            .orElseThrow(() -> new IllegalArgumentException("Langue non trouvée: " + langCode));
        
        Optional<Translation> existing = translationRepository.findByLanguageAndKey(language, key);
        
        Translation translation;
        if (existing.isPresent()) {
            translation = existing.get();
            translation.setValue(value);
            translation.setUpdatedAt(LocalDateTime.now());
        } else {
            translation = Translation.builder()
                .language(language)
                .namespace(namespace)
                .key(key)
                .value(value)
                .build();
        }
        
        Translation saved = translationRepository.save(translation);
        log.info("✓ Translation saved: {} = {}", key, value);
        return saved;
    }

    @Transactional
    @CacheEvict(value = "translations", allEntries = true)
    public Translation updateTranslation(String langCode, String key, String newValue) {
        log.info("📝 Updating translation {}/{}", langCode, key);
        
        Language language = languageRepository.findByCode(langCode)
            .orElseThrow(() -> new IllegalArgumentException("Langue non trouvée: " + langCode));
        
        Translation translation = translationRepository.findByLanguageAndKey(language, key)
            .orElseThrow(() -> new IllegalArgumentException("Traduction non trouvée: " + key));
        
        translation.setValue(newValue);
        translation.setUpdatedAt(LocalDateTime.now());
        
        Translation updated = translationRepository.save(translation);
        log.info("✓ Translation updated: {} = {}", key, newValue);
        return updated;
    }

    @Transactional
    @CacheEvict(value = "translations", allEntries = true)
    public void deleteTranslation(String langCode, String key) {
        log.info("🗑️ Deleting translation {}/{}", langCode, key);
        
        Language language = languageRepository.findByCode(langCode)
            .orElseThrow(() -> new IllegalArgumentException("Langue non trouvée: " + langCode));
        
        Translation translation = translationRepository.findByLanguageAndKey(language, key)
            .orElseThrow(() -> new IllegalArgumentException("Traduction non trouvée: " + key));
        
        translationRepository.delete(translation);
        log.info("✓ Translation deleted: {}/{}", langCode, key);
    }
}