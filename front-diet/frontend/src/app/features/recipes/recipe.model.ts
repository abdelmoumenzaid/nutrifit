export interface Recipe {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  source: string;
  servings: number;
  calories: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  category: string | null;
  area: string | null;
  tags: string | null;
  instructions: string | null;
  ingredientsJson: string | null;
  
  // AJOUTE CES 2 LIGNES
  externalId?: string | null;
}
