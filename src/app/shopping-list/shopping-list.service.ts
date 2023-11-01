import {Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  ingredientsChanged = new Subject<Ingredient[]>();
  summedIngredientsChanged = new Subject<Ingredient[]>();
  startedEditing = new Subject<string>();

  private ingredients: Ingredient[] = [];
  private summedIngredients: Ingredient[] = [];

  constructor() {
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    this.ingredientsChanged.next(this.sortIngredientsByName(this.ingredients.slice()));
    this.sumIngredients();
    this.summedIngredientsChanged.next(this.sortIngredientsByName(this.summedIngredients.slice()));
  }

  importIngredients(ingredients: Ingredient[]) {
    this.ingredients = ingredients;
    this.ingredientsChanged.next(this.sortIngredientsByName(this.ingredients.slice()));
    this.sumIngredients();
    this.summedIngredientsChanged.next(this.sortIngredientsByName(this.summedIngredients.slice()));
  }

  getIngredients(): Ingredient[] {
    return this.sortIngredientsByName(this.ingredients.slice());
  }

  getSummedIngredients(): Ingredient[] {
    return this.sortIngredientsByName(this.summedIngredients.slice());
  }

  getIngredient(id: string) {
    return this.ingredients.find((ingredient) => ingredient.id === id);
  }

  updateIngredient(id: string, newIngredient: Ingredient) {
    const index = this.ingredients.findIndex((ingredient) => ingredient.id === id);
    if (index !== -1) {
      this.ingredients[index] = newIngredient;
    }
    this.ingredientsChanged.next(this.sortIngredientsByName(this.ingredients.slice()));
    this.sumIngredients();
    this.summedIngredientsChanged.next(this.sortIngredientsByName(this.summedIngredients.slice()));
  }

  deleteIngredient(id: string) {
    this.ingredients = this.ingredients.filter((ingredient) => ingredient.id !== id)
    this.ingredientsChanged.next(this.sortIngredientsByName(this.ingredients.slice()));
    this.sumIngredients();
    this.summedIngredientsChanged.next(this.sortIngredientsByName(this.summedIngredients.slice()));
  }

  sortIngredientsByName(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  sumIngredients() {
    const ingredientMap = new Map<string, Ingredient>();

    for (const ingredient of this.ingredients) {
      if (ingredientMap.has(ingredient.name)) {
        const existingIngredient = ingredientMap.get(ingredient.name);
        existingIngredient!.quantity += ingredient.quantity;
      } else {
        ingredientMap.set(ingredient.name, { ...ingredient });
      }
    }

    this.summedIngredients = Array.from(ingredientMap.values());
  }
}
