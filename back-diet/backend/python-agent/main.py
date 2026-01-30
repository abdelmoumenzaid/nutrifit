import os
import requests
import urllib.parse
import json
import re

from fastapi import Form, UploadFile, File
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ✅ AJOUTE

from pydantic import BaseModel, Field
from groq import Groq
from dotenv import load_dotenv
from typing import Optional
from typing import List, Literal

from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="NutriCoach AI Agent")

# ✅ CONFIGURE CORS - AJOUTE CECI JUSTE APRÈS app = FastAPI(...)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://front-end-production-0ec7.up.railway.app",
        "https://backend-production-44d4.up.railway.app",
        "http://localhost:4200",
        "http://localhost:3000",
        "http://localhost:8081",
        "https://agent-ia-production-7fb0.up.railway.app",  # Add production agent URL if needed
        "*",  # Allow all for dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=3600,
)

# ✅ AJOUTE AUSSI CET ENDPOINT POUR TESTER CORS
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"message": "OK"}

PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ImageRecipesRequest(BaseModel):
    prompt: str | None = None

class RecipeRequest(BaseModel):
    prompt: str

class RecipeResponse(BaseModel):
    recipe: str          # JSON structuré en string
    provider: str
    imageUrl: str | None = None

class RecipeSummary(BaseModel):
    id: str
    title: str
    ingredientsJson: Optional[str] = None
    servings: Optional[int] = None
    calories: Optional[int] = None
    proteinG: Optional[int] = None
    carbsG: Optional[int] = None
    fatG: Optional[int] = None
    instructions: Optional[str] = None

class RecipeAnalysisResponse(BaseModel):
    analysis: str
    provider: str

class ChatMessage(BaseModel):
    message: str

class ChatAgentResponse(BaseModel):
    answer: str
    provider: str

class RecipeCard(BaseModel):
    title: str
    imageUrl: str | None = None
    calories: int | None = None
    readyInMinutes: int | None = None
    difficulty: str | None = None
    category: str | None = None
    area: str | None = None

class RecipeSuggestionsOut(BaseModel):
    intro: str
    recipes: list[RecipeCard]

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    session_id: str
    history: Optional[List[Message]] = []
    message: str
    
@app.post("/api/recipes/suggest", response_model=RecipeSuggestionsOut)
async def suggest_recipes(msg: ChatMessage):
    try:
        system_msg = (
            "Tu es un chef marocain et coach nutrition. "
            "On te demande des idées de recettes. "
            "Réponds UNIQUEMENT en JSON valide, sans texte autour, au format : "
            "{"
            '  "intro": "string",'
            '  "recipes": ['
            '    {'
            '      "title": "string",'
            '      "imageUrl": "string ou null",'
            '      "calories": number ou null,'
            '      "readyInMinutes": number ou null,'
            '      "difficulty": "string ou null",'
            '      "category": "string ou null",'
            '      "area": "string ou null"'
            '    }'
            "  ]"
            "}"
            "Ne mets JAMAIS de commentaires, pas de champs en trop, "
            "pas de trailing comma, pas de `| null` dans les valeurs."
        )

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": msg.message},
            ],
            temperature=0.7,
            max_tokens=600,
        )

        raw = completion.choices[0].message.content.strip()
        print(f"Raw suggest: {raw[:200]}...")

        # 1) Essayer directement
        try:
            data = RecipeSuggestionsOut.model_validate_json(raw)
            return data
        except Exception:
            m = re.search(r'\{.*\}', raw, re.DOTALL)
            if not m:
                raise HTTPException(status_code=500, detail="Réponse IA sans JSON")
            json_text = m.group(0)
            try:
                parsed = json.loads(json_text)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail=f"JSON invalide IA: {e}")
            return RecipeSuggestionsOut.model_validate(parsed)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "nutricoach-ai-agent"}

def search_recipe_image(query: str) -> str | None:
    if not PIXABAY_API_KEY:
        return None

    params = {
        "key": PIXABAY_API_KEY,
        "q": query,
        "image_type": "photo",
        "orientation": "horizontal",
        "category": "food",
        "per_page": 10,
        "safesearch": "true",
    }

    url = "https://pixabay.com/api/?" + urllib.parse.urlencode(params)
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    data = resp.json()
    hits = data.get("hits") or []
    if not hits:
        return None

    return hits[0].get("webformatURL") or hits[0].get("largeImageURL")

@app.post("/api/recipes/generate", response_model=RecipeResponse)
async def generate_recipe(req: RecipeRequest):
    try:
        system_msg = (
            "Tu es un chef cuisinier. "
            "On te demande de générer UNE recette simple. "
            "Réponds UNIQUEMENT en JSON valide, sans texte avant ni après. "
            "Format EXACT : {"
            '  "title": "string en français",'
            '  "description": "string en français",'
            '  "servings": 4,'
            '  "ingredients": ['
            '    { "name": "chicken breast", "quantity": 200, "unit": "g" }'
            '  ],'
            '  "steps": ['
            '    "Étape 1 en français...",'
            '    "Étape 2 en français..."'
            '  ]'
            "}"
            "IMPORTANT : "
            "- Les noms et unités des ingrédients (ingredients[].name, ingredients[].unit) doivent être en anglais simple "
            "  (ex: 'chicken breast', 'olive oil', 'wheat flour', 'milk', 'egg', 'g', 'ml', 'piece', 'tbsp', 'tsp'). "
            "- Ne mets jamais la quantité dans le name, seulement dans quantity + unit. "
            "- Ne mets JAMAIS de markdown, astérisques, titres, listes, ni texte hors du JSON."
        )


        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": req.prompt},
            ],
            temperature=0.7,
            max_tokens=700,
        )

        recipe_text = completion.choices[0].message.content.strip()

        # On utilise la première ligne du JSON comme source de mots-clés pour l'image
        title_line = recipe_text.split("\n", 1)[0]
        lower = title_line.lower()

        keywords: list[str] = []

        if "poulet" in lower or "chicken" in lower:
            keywords.append("chicken")
        if "boeuf" in lower or "bœuf" in lower or "beef" in lower:
            keywords.append("beef")
        if "tajine" in lower or "tagine" in lower:
            keywords.append("tajine")
        if "salade" in lower or "salad" in lower:
            keywords.append("salad")
        if "poisson" in lower or "saumon" in lower or "thon" in lower or "fish" in lower:
            keywords.append("fish")
        if "champignon" in lower or "mushroom" in lower:
            keywords.append("mushroom")

        query = " ".join(keywords) + " food dish"
        image_url = search_recipe_image(query.strip()) if query.strip() else None

        return RecipeResponse(
            recipe=recipe_text,
            provider="groq-llama3",
            imageUrl=image_url,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recipes/analyze", response_model=RecipeAnalysisResponse)
async def analyze_recipe(summary: RecipeSummary):
    try:
        system_msg = (
            "Tu es un coach en nutrition. "
            "On te donne une recette avec ses ingrédients (JSON), ses instructions, "
            "et éventuellement ses macros. "
            "Tu analyses la recette pour un utilisateur lambda.\n\n"
            "Réponds en français, structuré en 3 sections claires avec des titres :\n"
            "1) Profil nutritionnel : résume les apports (protéines, glucides, lipides, calories) "
            "   et le type de plat (riche en protéines, gras, sucré, équilibré...).\n"
            "2) Pour qui c'est adapté : par ex. prise de masse, sèche, végétarien, vegan, sans gluten, "
            "   personne pressée, repas familial, etc. Précise si ce n'est PAS adapté à certains profils.\n"
            "3) Conseils pratiques : propose 2-4 conseils simples (portion, moment de la journée, "
            "   substitutions plus saines ou plus protéinées, idées d'accompagnement).\n"
            "Sois concret, bienveillant, 10-15 phrases max."
            "Formate toujours tes réponses en sections avec des titres en **gras**, des listes à puces ou numérotées, et des paragraphes courts (2–3 phrases max).  N’écris jamais de gros blocs de texte. Utilise du markdown simple (titres en gras, listes, lignes vides entre les sections). Adresse-toi à la deuxième personne (“tu”)."

        )

        user_content = f"ID: {summary.id}\n"
        user_content += f"Titre: {summary.title}\n\n"
        user_content += f"Ingrédients (JSON): {summary.ingredientsJson}\n\n"
        user_content += (
            f"Macros (optionnel) - calories: {summary.calories}, "
            f"protéines: {summary.proteinG}, glucides: {summary.carbsG}, "
            f"lipides: {summary.fatG}\n\n"
        )
        user_content += f"Instructions:\n{summary.instructions}\n"

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
            max_tokens=700,
        )

        analysis_text = completion.choices[0].message.content.strip()

        return RecipeAnalysisResponse(
            analysis=analysis_text,
            provider="groq-llama3",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatAgentResponse)
async def chat(req: ChatRequest):
    try:
        print(f"Chat session: {req.session_id}, message: {req.message[:50]}...")
        
        system_msg = (
            "Tu es un coach nutrition marocain expert et bienveillant. "
            "Tu conseilles des recettes saines, adaptées au poids, objectifs, contraintes alimentaires. "
            "Pour les messages contenant 'recette' ou 'recettes', suggère 3-5 idées avec calories/temps. "
            "Réponds en français naturel, précis, motivant, en 5-10 phrases maximum. "
            "Si besoin de recettes détaillées, dis 'Voici des idées de recettes :' et attends."
            "Formate toujours tes réponses en sections avec des titres en **gras**, des listes à puces ou numérotées, et des paragraphes courts (2–3 phrases max). N’écris jamais de gros blocs de texte. Utilise du markdown simple (titres en gras, listes, lignes vides entre les sections). Adresse-toi à la deuxième personne (“tu”)."
        )

        # Construire les messages avec le contexte
        messages = [{"role": "system", "content": system_msg}]

        # Historique (10 derniers échanges max)
        for m in req.history[-10:]:
            messages.append({"role": m.role, "content": m.content})

        # Nouveau message utilisateur
        messages.append({"role": "user", "content": req.message})

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=600,
        )

        answer_text = completion.choices[0].message.content.strip()
        print(f"Réponse générée: {answer_text[:100]}...")
        
        return ChatAgentResponse(
            answer=answer_text,
            provider="groq-llama3",
        )

    except Exception as e:
        print(f"Erreur chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    # Endpoint pour suggestions de recettes à partir d'images
# @app.post("/api/chat/recipes-from-images", response_model=RecipeSuggestionsOut)
# async def recipes_from_images(
#         prompt: str = Form("Génère 4 recettes à partir des ingrédients visibles sur ces photos."),
#         images: List[UploadFile] = File(...)
#     ):
#         """
#         Analyse de VRAIES photos:
#         - lit les fichiers envoyés
#         - construit un message vision
#         - demande à Groq de déduire les ingrédients et proposer des recettes
#         - renvoie RecipeSuggestionsOut
#         """
#         try:
#             # 1) Lire les images et construire des data: URLs (base64)
#             import base64

#             vision_messages: list[dict] = [
#                 {
#                     "role": "user",
#                     "content": [
#                         {
#                             "type": "input_text",
#                             "text": (
#                                 "Tu vois plusieurs photos d'ingrédients réels. "
#                                 "Identifie les ingrédients principaux (en français), "
#                                 "puis propose 4 idées de recettes adaptées. "
#                                 "Tu dois répondre UNIQUEMENT en JSON au format "
#                                 "{ \"intro\": string, \"recipes\": [ RecipeCard... ] } "
#                                 "comme dans RecipeSuggestionsOut."
#                             )
#                         }
#                     ],
#                 }
#             ]

#             # Ajouter chaque image comme input_image
#             contents = vision_messages[0]["content"]
#             for img in images:
#                 data = await img.read()
#                 b64 = base64.b64encode(data).decode("utf-8")
#                 data_url = f"data:{img.content_type};base64,{b64}"
#                 contents.append({
#                     "type": "input_image",
#                     "image_url": data_url
#                 })

#             # Ajouter le prompt utilisateur à la fin
#             contents.append({
#                 "type": "input_text",
#                 "text": prompt
#             })

#             # 2) Appel modèle vision Groq (par ex. llama-3.2-11b-vision-preview)
#             completion = groq_client.chat.completions.create(
#                 model="llama-3.2-11b-vision-preview",
#                 messages=vision_messages,
#                 temperature=0.6,
#                 max_tokens=800,
#             )

#             raw = completion.choices[0].message.content.strip()
#             print(f"Raw suggest from REAL images: {raw[:200]}...")

#             # 3) Parsing strict en RecipeSuggestionsOut
#             try:
#                 data = RecipeSuggestionsOut.model_validate_json(raw)
#                 return data
#             except Exception:
#                 m = re.search(r"\{.*\}", raw, re.DOTALL)
#                 if not m:
#                     raise HTTPException(status_code=500, detail="Réponse IA sans JSON")
#                 json_text = m.group(0)
#                 try:
#                     parsed = json.loads(json_text)
#                 except json.JSONDecodeError as e:
#                     raise HTTPException(status_code=500, detail=f"JSON invalide IA: {e}")
#                 return RecipeSuggestionsOut.model_validate(parsed)

#         except Exception as e:
#             raise HTTPException(status_code=500, detail=str(e))
@app.post("/api/chat/recipes-from-images", response_model=RecipeSuggestionsOut)
async def recipes_from_images(prompt: str = Form(...), images: List[UploadFile] = File(...)):
    print(f"📸 Images reçues: {[img.filename for img in images]} ({len(images)} fichiers)")
    
    # SOLUTION DIRECTE : Copie le code de suggest_recipes mais adapté
    msg = f"{prompt} (avec images: {[img.filename for img in images]})"
    
    try:
        system_msg = """Tu es un chef marocain et coach nutrition. On te demande des idées de recettes. 
        Réponds UNIQUEMENT en JSON valide, sans texte autour, au format :
        {
          "intro": "string",
          "recipes": [
            {
              "title": "string", 
              "imageUrl": "string ou null", 
              "calories": number ou null, 
              "readyInMinutes": number ou null, 
              "difficulty": "string ou null", 
              "category": "string ou null", 
              "area": "string ou null"
            }
          ]
        }
        Ne mets JAMAIS de commentaires, pas de champs en trop, pas de trailing comma."""
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": msg}
            ],
            temperature=0.7,
            max_tokens=600
        )
        
        raw = completion.choices[0].message.content.strip()
        print(f"Raw suggest from images: {raw[:200]}...")
        
        # Parsing JSON direct
        try:
            data = RecipeSuggestionsOut.model_validate_json(raw)
            return data
        except:
            # Extraction JSON entre { et }
            import re
            m = re.search(r'\{.*\}', raw, re.DOTALL)
            if not m:
                raise HTTPException(status_code=500, detail="Réponse IA sans JSON")
            json_text = m.group(0)
            parsed = json.loads(json_text)
            return RecipeSuggestionsOut.model_validate(parsed)
            
    except Exception as e:
        print(f"Erreur recipes-from-images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
