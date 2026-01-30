package com.recipe_service.demo.translation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/translations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "https://front-end-production-0ec7.up.railway.app"})
public class TranslationController {

    private final TranslationService translationService;

    /**
     * GET /api/v1/translations/languages
     * Récupère toutes les langues disponibles
     */
    @GetMapping("/languages")
    public ResponseEntity<List<Language>> getLanguages() {
        log.info("📥 GET /api/v1/translations/languages");
        List<Language> languages = translationService.getActiveLanguages();
        return ResponseEntity.ok(languages);
    }

    /**
     * GET /api/v1/translations/{lang}/{namespace}
     * Récupère toutes les traductions d'un namespace pour une langue
     * Exemple: GET /api/v1/translations/en/profile
     */
    @GetMapping("/{lang}/{namespace}")
    public ResponseEntity<Map<String, String>> getNamespaceTranslations(
            @PathVariable String lang,
            @PathVariable String namespace) {
        log.info("📥 GET /api/v1/translations/{}/{}", lang, namespace);
        Map<String, String> translations = translationService.getNamespaceTranslations(lang, namespace);
        return ResponseEntity.ok(translations);
    }

    /**
     * GET /api/v1/translations/{lang}?key=...
     * Récupère une traduction spécifique
     * Exemple: GET /api/v1/translations/en?key=profile.language
     */
    @GetMapping("/{lang}")
    public ResponseEntity<Map<String, String>> getTranslation(
            @PathVariable String lang,
            @RequestParam String key) {
        log.info("📥 GET /api/v1/translations/{}?key={}", lang, key);
        String value = translationService.getTranslation(lang, key);
        return ResponseEntity.ok(Map.of(key, value));
    }

    /**
     * POST /api/v1/translations/{lang}/{namespace}
     * Crée ou met à jour une traduction
     */
    @PostMapping("/{lang}/{namespace}")
    public ResponseEntity<Translation> saveTranslation(
            @PathVariable String lang,
            @PathVariable String namespace,
            @RequestBody Map<String, String> payload) {
        log.info("📤 POST /api/v1/translations/{}/{}", lang, namespace);
        
        String key = payload.get("key");
        String value = payload.get("value");
        
        if (key == null || value == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Translation translation = translationService.saveTranslation(lang, namespace, key, value);
        return ResponseEntity.ok(translation);
    }

    /**
     * PUT /api/v1/translations/{lang}
     * Met à jour une traduction existante
     */
    @PutMapping("/{lang}")
    public ResponseEntity<Translation> updateTranslation(
            @PathVariable String lang,
            @RequestBody Map<String, String> payload) {
        log.info("📝 PUT /api/v1/translations/{}", lang);
        
        String key = payload.get("key");
        String value = payload.get("value");
        
        if (key == null || value == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Translation translation = translationService.updateTranslation(lang, key, value);
        return ResponseEntity.ok(translation);
    }

    /**
     * DELETE /api/v1/translations/{lang}?key=...
     * Supprime une traduction
     */
    @DeleteMapping("/{lang}")
    public ResponseEntity<Void> deleteTranslation(
            @PathVariable String lang,
            @RequestParam String key) {
        log.info("🗑️ DELETE /api/v1/translations/{}?key={}", lang, key);
        translationService.deleteTranslation(lang, key);
        return ResponseEntity.noContent().build();
    }
}