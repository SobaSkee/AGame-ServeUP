import { collections } from "./database.service.ts"
import { DeleteResult, InsertOneResult, WithId, ObjectId} from "mongodb"
import User from "../models/user.ts"
import SavedRecipe from "../models/saved_recipes.ts"
import { Recipe, RecipeIngredient, RecipeInstruction } from "./recipeGeneration.ts"
import { getUserPantry, matchPantryIngredients } from "./pantry.service.ts"

export async function findRecipeBySourceAndUserId(source_id: string, user_id: ObjectId) : Promise<WithId<SavedRecipe> | null> {
    if (!collections.saved_recipes) throw new Error("Users services are not available");
    return collections.saved_recipes.findOne({source_id: source_id, user_id: user_id});
}

export async function saveRecipe(user_id: ObjectId, recipe: Recipe) : Promise<InsertOneResult<SavedRecipe> | null> {
    if (!collections.users) throw new Error("Users services are not available");
    if (!collections.saved_recipes) throw new Error("Recipe services are not available");

    const user = await collections.users.findOne({_id: user_id});
    if (user === null) throw new Error("Attempted to save recipe for a nonexistent user account");

    const new_recipe = saveRecipeFromGeneratedRecipe(recipe);
    const existing = await findRecipeBySourceAndUserId(new_recipe.source_id, user_id);
    if (existing !== null) {
        console.log(`Could not save recipe with id ${new_recipe.source_id} to user ${user_id}; user already has a recipe with that id saved.`);
        return null;
    }

    return await collections.saved_recipes.insertOne(new_recipe);
}

export async function unsaveRecipe(user_id: ObjectId, recipe_source_id: string) : Promise<DeleteResult> {
    if (!collections.saved_recipes) throw new Error("Recipe services are not available");

    const query = { source_id: recipe_source_id, user_id: user_id };
    return await collections.saved_recipes.deleteOne(query);
}

export function saveRecipeFromGeneratedRecipe(generated: Recipe) : SavedRecipe {
    const new_recipe: SavedRecipe = {
        created_at: new Date(),
        title: generated.title,
        description: generated.description,
        ingredients: generated.ingredients.map(ingredient => {return {
            name: ingredient.name, 
            amount: ingredient.amount ? ingredient.amount : null
        }}),
        instructions: generated.instructions.map(instruction_step => {return {
            step: instruction_step.step,
            instruction: instruction_step.instruction
        }}),
        prep_time: generated.prepTime,
        cook_time: generated.cookTime ? generated.cookTime : null,
        servings: generated.servings ? generated.servings : null,
        difficulty: generated.difficulty,
        cuisine: generated.cuisine ? generated.cuisine : null,
        image_url: generated.imageUrl ? generated.imageUrl : null,
        source_id: generated.id,
        is_spoonacular: !generated.id.startsWith('recipe-')
    };
    return new_recipe;
}

function difficultyOrThrow(difficulty_str: string) : "easy" | "medium" | "hard" {
    if (difficulty_str == "easy") return difficulty_str;
    if (difficulty_str == "medium") return difficulty_str;
    if (difficulty_str == "hard") return difficulty_str;
    throw new Error(`Unexpected recipe difficulty ${difficulty_str}`);
}

export function generatedRecipeFromSavedRecipeNoMatching(saved: SavedRecipe) : Recipe {
    var new_recipe: Recipe = {
        id: saved.source_id,
        title: saved.title,
        description: saved.description,
        ingredients: saved.ingredients.map(ingredient => {
            return ingredient.amount ? 
                {name: ingredient.name, amount: ingredient.amount} :
                {name: ingredient.name}
        }),
        instructions: saved.instructions.map(instruction_step => {return {
            step: instruction_step.step, 
            instruction: instruction_step.instruction
        }}),
        prepTime: saved.prep_time,
        difficulty: difficultyOrThrow(saved.difficulty),
    }
    if (saved.cook_time) new_recipe.cookTime = saved.cook_time;
    if (saved.servings) new_recipe.servings = saved.servings;
    if (saved.cuisine) new_recipe.cuisine = saved.cuisine;
    if (saved.image_url) new_recipe.imageUrl = saved.image_url;

    return new_recipe;
}

export async function generatedRecipeFromSavedRecipeAndMatchIngredients(saved: SavedRecipe) : Promise<Recipe> {
    var new_recipe: Recipe = generatedRecipeFromSavedRecipeNoMatching(saved);

    if (!saved.user_id) { return new_recipe; }
    try { 
        const user_pantry = await getUserPantry(saved.user_id); 
        if (!user_pantry) return new_recipe;
        new_recipe.matchedIngredients = matchPantryIngredients(user_pantry, new_recipe.ingredients);
        return new_recipe;
    }
    catch(error) {
        if (error instanceof Error) console.log(`Error while matching recipe ingredients: ${error.message}`);
        return new_recipe;
    }
}

export async function getUserSavedRecipes(user_id: ObjectId) : Promise<SavedRecipe[]> {
    if (!collections.saved_recipes) throw new Error("Recipe services are not available");
    return (await collections.saved_recipes.find({user_id: user_id}).toArray()) as SavedRecipe[];
}

export async function formatSavedRecipesForFrontendExport(saved_recipes: SavedRecipe[], user_id: ObjectId) : Promise<Recipe[]> {
    var converted_recipes: Recipe[] = saved_recipes.map(recipe => generatedRecipeFromSavedRecipeNoMatching(recipe));

    try {
        const user_pantry = await getUserPantry(user_id); 
        if (!user_pantry) return converted_recipes;

        const all_available = new Set(user_pantry.ingredients.map(ingredient => ingredient.name));
        converted_recipes.forEach((recipe, i) => {
            const all_required = new Set(recipe.ingredients.map(ingredient => ingredient.name));
            converted_recipes[i].matchedIngredients = Array.from(all_required).filter(name => all_available.has(name));
        });
        return converted_recipes;
    }
    catch(error) {
        if (error instanceof Error) console.log(`Error while matching recipe ingredients: ${error.message}`);
        return converted_recipes;
    }
}