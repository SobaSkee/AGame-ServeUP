import { collections } from "./database.service.ts"
import { UpdateResult, InsertOneResult, WithId, ObjectId } from "mongodb"
import User from "../models/user.ts"
import Pantry from "../models/pantry.ts"
import { RecipeIngredient } from "./recipeGeneration.ts"

export async function getUserPantry(user_id: ObjectId) : Promise<WithId<Pantry> | null> {
    if (!collections.pantries) throw new Error("Users services are not available");
    return collections.pantries.findOne({user_id: user_id});
}

export async function createNewPantry(user_id: ObjectId) : Promise<InsertOneResult<Pantry>> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
    if (await getUserPantry(user_id) !== null) throw new Error(`Pantry already exists for user ${user_id}`);
    
    const new_pantry: Pantry = {
        created_at: new Date(),
        last_updated: new Date(),
        user_id: user_id,
        ingredients: [],
    };

    return await collections.pantries.insertOne(new_pantry);
}

export function matchPantryIngredients(pantry: Pantry, ingredients: RecipeIngredient[]) : string[] {
    const all_required = new Set(ingredients.map(ingredient => ingredient.name));
    const all_available = new Set(pantry.ingredients.map(ingredient => ingredient.name));
    return Array.from(all_required.intersection(all_available));
}