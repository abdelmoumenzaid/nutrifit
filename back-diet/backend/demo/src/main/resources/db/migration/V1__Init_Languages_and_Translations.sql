-- V2__Insert_Languages_and_Translations.sql
-- Insert les données de langues et traductions

-- Nettoie d'abord (au cas où)
TRUNCATE TABLE translations;
TRUNCATE TABLE languages;

-- Insert languages
INSERT INTO languages (code, name, native_name, active, sort_order) VALUES
('fr', 'Français', 'Français', true, 1),
('en', 'English', 'English', true, 2),
('es', 'Español', 'Español', true, 3),
('ar', 'العربية', 'العربية', true, 4)
ON CONFLICT (code) DO NOTHING;

-- Insert COMMON translations - FR
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (1, 'common', 'save', 'Enregistrer'),
  (1, 'common', 'cancel', 'Annuler'),
  (1, 'common', 'delete', 'Supprimer'),
  (1, 'common', 'edit', 'Modifier'),
  (1, 'common', 'loading', 'Chargement...'),
  (1, 'common', 'error', 'Erreur'),
  (1, 'common', 'success', 'Succès')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert COMMON translations - EN
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (2, 'common', 'save', 'Save'),
  (2, 'common', 'cancel', 'Cancel'),
  (2, 'common', 'delete', 'Delete'),
  (2, 'common', 'edit', 'Edit'),
  (2, 'common', 'loading', 'Loading...'),
  (2, 'common', 'error', 'Error'),
  (2, 'common', 'success', 'Success')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert COMMON translations - ES
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (3, 'common', 'save', 'Guardar'),
  (3, 'common', 'cancel', 'Cancelar'),
  (3, 'common', 'delete', 'Eliminar'),
  (3, 'common', 'edit', 'Editar'),
  (3, 'common', 'loading', 'Cargando...'),
  (3, 'common', 'error', 'Error'),
  (3, 'common', 'success', 'Éxito')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert COMMON translations - AR
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (4, 'common', 'save', 'حفظ'),
  (4, 'common', 'cancel', 'إلغاء'),
  (4, 'common', 'delete', 'حذف'),
  (4, 'common', 'edit', 'تعديل'),
  (4, 'common', 'loading', 'جاري التحميل...'),
  (4, 'common', 'error', 'خطأ'),
  (4, 'common', 'success', 'نجاح')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert PROFILE translations - FR
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (1, 'profile', 'language', 'Langue'),
  (1, 'profile', 'preferences', 'Choisissez votre langue'),
  (1, 'profile', 'settings', 'Paramètres'),
  (1, 'profile', 'profile', 'Profil'),
  (1, 'profile', 'email', 'Email'),
  (1, 'profile', 'username', 'Nom d''utilisateur')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert PROFILE translations - EN
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (2, 'profile', 'language', 'Language'),
  (2, 'profile', 'preferences', 'Choose your language'),
  (2, 'profile', 'settings', 'Settings'),
  (2, 'profile', 'profile', 'Profile'),
  (2, 'profile', 'email', 'Email'),
  (2, 'profile', 'username', 'Username')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert DASHBOARD translations - FR
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (1, 'dashboard', 'welcome', 'Bienvenue'),
  (1, 'dashboard', 'recipes', 'Recettes'),
  (1, 'dashboard', 'meals', 'Repas'),
  (1, 'dashboard', 'nutrition', 'Nutrition'),
  (1, 'dashboard', 'createRecipe', 'Créer une recette')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert DASHBOARD translations - EN
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (2, 'dashboard', 'welcome', 'Welcome'),
  (2, 'dashboard', 'recipes', 'Recipes'),
  (2, 'dashboard', 'meals', 'Meals'),
  (2, 'dashboard', 'nutrition', 'Nutrition'),
  (2, 'dashboard', 'createRecipe', 'Create Recipe')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert DAY-TRACKING translations - FR
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (1, 'day-tracking', 'addMeal', 'Ajouter un repas'),
  (1, 'day-tracking', 'removeMeal', 'Supprimer un repas'),
  (1, 'day-tracking', 'calories', 'Calories'),
  (1, 'day-tracking', 'protein', 'Protéines'),
  (1, 'day-tracking', 'carbs', 'Glucides'),
  (1, 'day-tracking', 'fat', 'Lipides')
ON CONFLICT (language_id, namespace, key) DO NOTHING;

-- Insert DAY-TRACKING translations - EN
INSERT INTO translations (language_id, namespace, key, value) 
VALUES 
  (2, 'day-tracking', 'addMeal', 'Add Meal'),
  (2, 'day-tracking', 'removeMeal', 'Remove Meal'),
  (2, 'day-tracking', 'calories', 'Calories'),
  (2, 'day-tracking', 'protein', 'Protein'),
  (2, 'day-tracking', 'carbs', 'Carbs'),
  (2, 'day-tracking', 'fat', 'Fat')
ON CONFLICT (language_id, namespace, key) DO NOTHING;