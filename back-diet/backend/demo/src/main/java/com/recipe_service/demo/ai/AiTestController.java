package com.recipe_service.demo.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipe_service.demo.nutrition.NutritionService;
import com.recipe_service.demo.recipe.Recipe;
import com.recipe_service.demo.recipe.RecipeRepository;
import lombok.extern.slf4j.Slf4j;  // ✅ AJOUTER CETTE LIGNE
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Slf4j  // ✅ AJOUTER CETTE ANNOTATION
@RestController
@RequestMapping("/api/public/ai")
@CrossOrigin(origins = "*")
public class AiTestController {

    private final RecipeAgentClient recipeAgentClient;
    private final RecipeRepository recipeRepository;
    private final NutritionService nutritionService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    @Value("${ai.agent.url:http://127.0.0.1:8000}")
    private String pythonAgentBaseUrl;

    public AiTestController(RecipeAgentClient recipeAgentClient,
                            RecipeRepository recipeRepository,
                            NutritionService nutritionService,
                            RestTemplate restTemplate) {
        this.recipeAgentClient = recipeAgentClient;
        this.recipeRepository = recipeRepository;
        this.nutritionService = nutritionService;
        this.restTemplate = restTemplate;
    }

    public static class AiIngredient {
        public String name;
        public double quantity;
        public String unit;
    }

    public static class AiRecipeJson {
        public String title;
        public String description;
        public Integer servings;
        public List<AiIngredient> ingredients;
        public List<String> steps;
    }

    public record ChatRecipeCard(
            UUID id,
            String title,
            String imageUrl,
            String category,
            String area,
            Integer calories,
            Integer readyInMinutes,
            String difficulty
    ) { }

    public record ChatRecipeResponse(
            String intro,
            List<ChatRecipeCard> recipes
    ) { }

    public record ChatRecipePrompt(String prompt) { }

    public record ChatRequestToAgent(
            String session_id,
            List<Map<String, String>> history,
            String message
    ) { }

    public record ChatAgentResponse(
            String answer,
            String provider
    ) { }

    @GetMapping("/health")
    public ResponseEntity<String> aiHealth() {
        return ResponseEntity.ok("AI Test Controller OK");
    }

    @GetMapping("/test-recipe")
    public ResponseEntity<String> testRecipe() {
        RecipeAgentClient.RecipeAgentResponse resp =
                recipeAgentClient.generateRecipe("recette rapide avec poulet");
        String body = "Réponse agent Python : " + resp.getRecipe()
                + " (provider=" + resp.getProvider() + ")";
        return ResponseEntity.ok(body);
    }

    @GetMapping("/recipes/{id}/nutrition/per-serving")
    public ResponseEntity<Map<String, Object>> getNutritionPerServing(@PathVariable UUID id) {
        Recipe r = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        int servings = r.getServings() > 0 ? r.getServings() : 1;
        Map<String, Object> result = new HashMap<>();
        result.put("caloriesPerServing", r.getCalories() != null ? r.getCalories() / servings : null);
        result.put("proteinPerServing", r.getProteinG() != null ? r.getProteinG() / servings : null);
        result.put("carbsPerServing", r.getCarbsG() != null ? r.getCarbsG() / servings : null);
        result.put("fatPerServing", r.getFatG() != null ? r.getFatG() / servings : null);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatAgentResponse> chat(@RequestBody Map<String, Object> body) {
        log.info("🔵 [CHAT] Requête reçue du frontend");
        log.info("📝 Payload keys: {}", body.keySet());

        try {
            String message = (String) body.getOrDefault("message", "");
            // ✅ FIX: session_id (pas sessionId!)
            String sessionId = (String) body.getOrDefault("session_id", "no-session");

            log.info("   Message: {}", message);
            log.info("   Session: {}", sessionId);

            List<Map<String, String>> history = List.of();
            Object historyObj = body.get("history");
            if (historyObj instanceof List) {
                List<Map<String, String>> safeHistory = new ArrayList<>();
                @SuppressWarnings("unchecked")
                List<Object> rawHistory = (List<Object>) historyObj;

                for (Object item : rawHistory) {
                    if (item instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> map = (Map<String, Object>) item;
                        if (map.containsKey("role") && map.containsKey("content")) {
                            String role = (String) map.get("role");
                            String content = (String) map.get("content");
                            if (role != null && content != null) {
                                safeHistory.add(Map.of("role", role, "content", content));
                            }
                        }
                    }
                }
                history = safeHistory;
            }

            ChatRequestToAgent req = new ChatRequestToAgent(sessionId, history, message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ChatRequestToAgent> entity = new HttpEntity<>(req, headers);

            // ✅ FIX: Ajouter logs détaillés
            log.info("🔄 Appel à l'agent Python: {}/api/chat", pythonAgentBaseUrl);

            ResponseEntity<ChatAgentResponse> resp;
            try {
                resp = restTemplate.postForEntity(
                        pythonAgentBaseUrl + "/api/chat", entity, ChatAgentResponse.class
                );
                log.info("✅ Réponse agent reçue: Status={}", resp.getStatusCode());
                log.info("📦 Contenu: {}", resp.getBody());
            } catch (Exception e) {
                log.error("❌ ERREUR APPEL AGENT", e);
                log.error("   URL: {}/api/chat", pythonAgentBaseUrl);
                log.error("   Type: {}", e.getClass().getSimpleName());
                log.error("   Message: {}", e.getMessage());
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Erreur appel agent Python: " + e.getMessage()
                );
            }

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return ResponseEntity.ok(resp.getBody());
            } else {
                log.error("❌ Agent retourné erreur: {}", resp.getStatusCode());
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Erreur agent Python: " + resp.getStatusCode()
                );
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ EXCEPTION INATTENDUE CHAT", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur interne: " + e.getMessage()
            );
        }
    }

    @PostMapping("/chat/recipes")
    public ResponseEntity<ChatRecipeResponse> chatRecipes(@RequestBody ChatRecipePrompt req) {
        String prompt = Optional.ofNullable(req.prompt()).orElse("").toLowerCase();
        log.info("🔵 [RECIPE] Prompt: {}", prompt);

        List<Recipe> dbRecipes = recipeRepository
                .findTop10ByTitleContainingIgnoreCaseOrTagsContainingIgnoreCase(prompt, prompt);

        if (!dbRecipes.isEmpty()) {
            List<ChatRecipeCard> cards = dbRecipes.stream()
                    .limit(5)
                    .map(r -> new ChatRecipeCard(
                            r.getId(),
                            r.getTitle(),
                            r.getImageUrl(),
                            r.getCategory(),
                            r.getArea(),
                            r.getCalories(),
                            (r.getPrepMinutes() != null ? r.getPrepMinutes() : 0)
                                    + (r.getCookMinutes() != null ? r.getCookMinutes() : 0),
                            "Moyen"
                    ))
                    .toList();

            ChatRecipeResponse resp = new ChatRecipeResponse(
                    "Voici quelques recettes trouvées dans ta base :",
                    cards
            );
            return ResponseEntity.ok(resp);
        }

        RecipeAgentClient.ChatSuggestionsResponse aiResp =
                recipeAgentClient.suggestRecipes(prompt);

        ChatRecipeResponse resp = new ChatRecipeResponse(
                aiResp.getIntro(),
                aiResp.getRecipes().stream()
                        .map(r -> new ChatRecipeCard(
                                null,
                                r.getTitle(),
                                r.getImageUrl(),
                                r.getCategory(),
                                r.getArea(),
                                r.getCalories(),
                                r.getReadyInMinutes(),
                                r.getDifficulty()
                        ))
                        .toList()
        );
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/chat/images")
    public ResponseEntity<ChatRecipeResponse> chatImages(
            @RequestParam("images") MultipartFile[] images,
            @RequestParam(value = "prompt", required = false) String prompt
    ) {
        if (images == null || images.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune image reçue");
        }

        String finalPrompt = (prompt != null && !prompt.isBlank())
                ? prompt
                : "Génère 4 recettes à partir des ingrédients visibles sur ces photos.";

        ChatRecipeResponse response = recipeAgentClient.chatRecipesWithFiles(finalPrompt, images);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-and-save")
    public ResponseEntity<Recipe> generateAndSave(@RequestParam String prompt) {
        log.info("🔵 [GENERATE] Prompt: {}", prompt);

        RecipeAgentClient.RecipeAgentResponse resp = recipeAgentClient.generateRecipe(prompt);
        log.info("📦 Réponse agent reçue");

        String json = resp.getRecipe();
        int start = json.indexOf('{');
        int end = json.lastIndexOf('}');
        if (start >= 0 && end > start) {
            json = json.substring(start, end + 1);
        }

        AiRecipeJson ai;
        try {
            ai = objectMapper.readValue(json, AiRecipeJson.class);
        } catch (JsonProcessingException e) {
            log.error("❌ Erreur JSON AI: {}", e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réponse AI invalide (JSON)",
                    e
            );
        }

        Recipe r = new Recipe();
        r.setTitle(ai.title != null ? ai.title.trim() : "Recette AI");
        r.setShortDescription(ai.description != null ? ai.description.trim() : "");
        r.setServings(ai.servings != null && ai.servings > 0 ? ai.servings : 2);

        if (ai.steps != null && !ai.steps.isEmpty()) {
            r.setInstructions(String.join("\n", ai.steps));
        } else {
            r.setInstructions(ai.description != null ? ai.description : "");
        }

        try {
            String ingredientsJson = objectMapper.writeValueAsString(
                    ai.ingredients != null ? ai.ingredients : List.of()
            );
            r.setIngredientsJson(ingredientsJson);
        } catch (JsonProcessingException e) {
            r.setIngredientsJson("[]");
        }

        r.setCalories(null);
        r.setProteinG(null);
        r.setCarbsG(null);
        r.setFatG(null);

        r.setPrepMinutes(15);
        r.setCookMinutes(20);

        r.setSource("AI");
        r.setCategory("Generated AI");
        r.setArea("International");
        r.setTags(null);

        String agentImageUrl = resp.getImageUrl();
        if (agentImageUrl != null && !agentImageUrl.isBlank()) {
            r.setImageUrl(agentImageUrl);
        } else {
            r.setImageUrl(getFallbackImageUrl(r.getTitle()));
        }

        r.setExternalId("AI-" + UUID.randomUUID());
        recipeRepository.save(r);

        try {
            nutritionService.computeNutritionForRecipe(r);
        } catch (Exception e) {
            log.warn("⚠️ Erreur calcul nutrition: {}", e.getMessage());
        }

        Recipe updated = recipeRepository.findById(r.getId()).orElse(r);
        return ResponseEntity.ok(updated);
    }

    private String getFallbackImageUrl(String title) {
        return "https://picsum.photos/seed/" + Math.abs(title.hashCode()) + "/800/400";
    }
}