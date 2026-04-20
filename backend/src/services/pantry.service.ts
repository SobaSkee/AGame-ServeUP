import { collections } from "./database.service.ts"
import { UpdateResult, InsertOneResult, WithId, ObjectId, DeleteResult } from "mongodb"
import User from "../models/user.ts"
import Pantry from "../models/pantry.ts"
import { RecipeIngredient } from "./recipeGeneration.ts"
import { findUserId, userIdExists } from "./user.service.ts"

export async function userPantryExists(user_id: ObjectId) : Promise<boolean> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
    const pantry = collections.pantries.findOne({user_id: user_id});
    return pantry !== null;
}

export async function getUserPantry(user_id: ObjectId) : Promise<WithId<Pantry> | null> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
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

export async function insertOrUpdatePantryItem(user_id: ObjectId, item: string, amount?: string) : Promise<UpdateResult> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
    if (!(await userIdExists(user_id))) throw new Error("User does not exist");

    var user_pantry = await getUserPantry(user_id);
    if (user_pantry === null) {
        const creation_result = await createNewPantry(user_id);
        if (!creation_result.acknowledged) throw new Error(`Could not find or create pantry for user ${user_id}`);
        user_pantry = await getUserPantry(user_id);
    }
    if (user_pantry === null)  throw new Error(`Could not find or create pantry for user ${user_id}`);
   
    const item_index = user_pantry.ingredients.findIndex(ingredient => ingredient.name === item);
    if (item_index === -1) user_pantry.ingredients.push({name: item, amount: amount ? amount : null});
    else user_pantry.ingredients[item_index] = {name: item, amount: amount ? amount : null};

    return collections.pantries.updateOne({_id: user_pantry._id}, {$set: {ingredients: user_pantry.ingredients, last_updated: new Date()}});
}

export async function insertOrUpdatePantryItems(user_id: ObjectId, items: RecipeIngredient[]) : Promise<UpdateResult> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
    if (!(await userIdExists(user_id))) throw new Error("User does not exist");

    var user_pantry = await getUserPantry(user_id);
    if (user_pantry === null) {
        const creation_result = await createNewPantry(user_id);
        if (!creation_result.acknowledged) throw new Error(`Could not find or create pantry for user ${user_id}`);
        user_pantry = await getUserPantry(user_id);
    }
    if (user_pantry === null) throw new Error(`Could not find or create pantry for user ${user_id}`);

    items.forEach(item => {
        if (user_pantry !== null) {
            const item_index = user_pantry.ingredients.findIndex(ingredient => ingredient.name === item.name);
            if (item_index === -1) user_pantry.ingredients.push({name: item.name, amount: item.amount ? item.amount : null});
            else user_pantry.ingredients[item_index] = {name: item.name, amount: item.amount ? item.amount : null};
        }
    })

    return collections.pantries.updateOne({_id: user_pantry._id}, {$set: {ingredients: user_pantry.ingredients, last_updated: new Date()}});
}

export async function deletePantryItems(user_id: ObjectId, items: string[]) : Promise<UpdateResult> {
    if (!collections.pantries) throw new Error("Pantry services are not available");
    if (!(await userIdExists(user_id))) throw new Error("User does not exist");

    var user_pantry = await getUserPantry(user_id);
    if (user_pantry === null) throw new Error(`Could not find pantry for user ${user_id}`);

    const item_set = new Set(items);
    user_pantry.ingredients = user_pantry.ingredients.filter(ingredient => !item_set.has(ingredient.name));

    return collections.pantries.updateOne({_id: user_pantry._id}, {$set: {ingredients: user_pantry.ingredients, last_updated: new Date()}});
}

export function matchPantryIngredients(pantry: Pantry, ingredients: RecipeIngredient[]) : string[] {
    const all_required = new Set(ingredients.map(ingredient => ingredient.name));
    const all_available = new Set(pantry.ingredients.map(ingredient => ingredient.name));
    return Array.from(all_required.intersection(all_available));
}