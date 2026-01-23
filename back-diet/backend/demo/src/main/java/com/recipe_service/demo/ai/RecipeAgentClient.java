package com.recipe_service.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecipeAgentClient {

    @Value("${ai.agent.url:http://127.0.0.1:8000}")
    private String agentBaseUrl;

    private final RestTemplate restTemplate;

    public RecipeAgentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public AiTestController.ChatRecipeResponse chatRecipesWithFiles(String prompt, MultipartFile[] files) {
        String url = agentBaseUrl + "/api/chat/recipes-from-images";
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("prompt", prompt);
        
        // Add each file as multipart part
        for (MultipartFile file : files) {
            try {
                ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename(); // Required for FastAPI
                    }
                };
                body.add("images", resource); // "images" matches FastAPI List[UploadFile]
            } catch (Exception e) {
                throw new RuntimeException("Failed to process file: " + file.getOriginalFilename(), e);
            }
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<AiTestController.ChatRecipeResponse> response =
                restTemplate.exchange(url, HttpMethod.POST, entity, AiTestController.ChatRecipeResponse.class);
        
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Agent error (files): " + response.getStatusCode());
        }
        
        return response.getBody();
    }
    // --------- Appel génération de recette complète (déjà utilisé par /generate-and-save) ---------

    public RecipeAgentResponse generateRecipe(String prompt) {
        String url = agentBaseUrl + "/api/recipes/generate";

        Map<String, String> body = new HashMap<>();
        body.put("prompt", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<RecipeAgentResponse> response =
                restTemplate.postForEntity(url, entity, RecipeAgentResponse.class);

        return response.getBody();
    }

    public static class RecipeAgentResponse {
        private String recipe;    // JSON structuré en string
        private String provider;
        private String imageUrl;  // URL d'image optionnelle

        public String getRecipe() {
            return recipe;
        }

        public void setRecipe(String recipe) {
            this.recipe = recipe;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    // --------- DTO + méthode pour les suggestions de recettes (cartes pour le chat) ---------

    // reflète la réponse FastAPI /api/recipes/suggest
    public static class ChatSuggestionsResponse {
        private String intro;
        private List<SimpleRecipeCard> recipes;

        public String getIntro() {
            return intro;
        }

        public void setIntro(String intro) {
            this.intro = intro;
        }

        public List<SimpleRecipeCard> getRecipes() {
            return recipes;
        }

        public void setRecipes(List<SimpleRecipeCard> recipes) {
            this.recipes = recipes;
        }
    }

    public static class SimpleRecipeCard {
        private String title;
        private String imageUrl;
        private Integer calories;
        private Integer readyInMinutes;
        private String difficulty;
        private String category;
        private String area;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public Integer getCalories() {
            return calories;
        }

        public void setCalories(Integer calories) {
            this.calories = calories;
        }

        public Integer getReadyInMinutes() {
            return readyInMinutes;
        }

        public void setReadyInMinutes(Integer readyInMinutes) {
            this.readyInMinutes = readyInMinutes;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getArea() {
            return area;
        }

        public void setArea(String area) {
            this.area = area;
        }
    }

    public ChatSuggestionsResponse suggestRecipes(String prompt) {
        String url = agentBaseUrl + "/api/recipes/suggest";

        Map<String, String> body = new HashMap<>();
        body.put("message", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<ChatSuggestionsResponse> response =
                restTemplate.postForEntity(url, entity, ChatSuggestionsResponse.class);

        return response.getBody();
    }

    // --------- ✅ méthode appelée par AiTestController.chatImages ---------

    public AiTestController.ChatRecipeResponse chatRecipes(String prompt, List<String> imagePaths) {
    String url = agentBaseUrl + "/api/chat/recipes-from-images"; // ↔ FastAPI
    Map<String, Object> body = new HashMap<>();
    body.put("prompt", prompt);
    body.put("image_paths", imagePaths); // pour plus tard si tu veux envoyer les paths

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

    ResponseEntity<AiTestController.ChatRecipeResponse> response =
            restTemplate.postForEntity(url, entity, AiTestController.ChatRecipeResponse.class);

    if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
        throw new RuntimeException("Erreur agent (images) : " + response.getStatusCode());
    }

    return response.getBody();
}

}
