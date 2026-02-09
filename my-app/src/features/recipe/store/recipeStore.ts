import { create } from "zustand";
import { Recipe } from "../types/recipe.types";

interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  selectedRecipe: null,
  isLoading: false,

  setRecipes: (recipes) => set({ recipes }),

  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),

  addRecipe: (recipe) =>
    set((state) => ({ recipes: [recipe, ...state.recipes] })),

  updateRecipe: (id, updatedRecipe) =>
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.id === id ? { ...r, ...updatedRecipe } : r,
      ),
    })),

  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    })),
}));
