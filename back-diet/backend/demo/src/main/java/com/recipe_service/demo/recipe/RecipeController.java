package com.recipe_service.demo.recipe;

import com.recipe_service.demo.ai.AiTestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeService service;
    private final RecipeImportService importService;
    private final AiTestController aiTestController;  // ✅ AJOUTER

    public RecipeController(RecipeService service,
                            RecipeImportService importService,
                            AiTestController aiTestController) {  // ✅ AJOUTER
        this.service = service;
        this.importService = importService;
        this.aiTestController = aiTestController;  // ✅ AJOUTER
    }

    // ===== GET Endpoints =====
    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponse>> search(
            @RequestParam(name = "search", required = false) String searchQuery) {
        return ResponseEntity.ok(service.search(searchQuery));
    }

    // ===== POST Endpoints =====
    @PostMapping
    public ResponseEntity<RecipeResponse> create(@RequestBody RecipeCreateRequest request) {
        RecipeResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/import/themealdb")
    public ResponseEntity<String> importFromMealDb() {
        int created = importService.importManyFromMealDb();
        return ResponseEntity.ok("Imported " + created + " recipes from TheMealDB");
    }

    // ===== AI Generation =====
    @PostMapping("/ai/generate-and-save")
    public ResponseEntity<Recipe> generateAIRecipe(@RequestParam String prompt) {
        try {
            // ✅ APPELER AiTestController.generateAndSave()
            return aiTestController.generateAndSave(prompt);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}