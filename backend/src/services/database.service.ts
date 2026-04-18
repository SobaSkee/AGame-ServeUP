import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

import DbUser from "../models/user"
import Recipe from "../models/recipe"
import SavedRecipe from "../models/saved_recipes"
import IngredientScan from "../models/ingredient_scan"
import ScanRecipe from "../models/scan_recipe"

export const collections: { 
	users?: mongoDB.Collection<DbUser>,
	recipes?: mongoDB.Collection<Recipe>,
	saved_recipes?: mongoDB.Collection<SavedRecipe>,
	ingredient_scans?: mongoDB.Collection<IngredientScan>,
	scan_recipes?: mongoDB.Collection<ScanRecipe>
} = {}

export async function connectToDatabase() {
	dotenv.config();
	if (!process.env.DB_NAME) throw new Error("DB_NAME is not defined in process environment");
	if (!process.env.DB_CONN_STRING) throw new Error("DB_CONN_STRING is not defined in process environment");
	if (!process.env.USERS_COLLECTION_NAME) throw new Error("USERS_COLLECTION_NAME is not defined in process environment");
	if (!process.env.RECIPES_COLLECTION_NAME) throw new Error("RECIPES_COLLECTION_NAME is not defined in process environment");
	if (!process.env.SAVED_RECIPES_COLLECTION_NAME) throw new Error("SAVED_RECIPES_COLLECTION_NAME is not defined in process environment");
	if (!process.env.INGREDIENT_SCANS_COLLECTION_NAME) throw new Error("INGREDIENT_SCANS_COLLECTION_NAME is not defined in process environment");
	if (!process.env.SCAN_RECIPES_COLLECTION_NAME) throw new Error("SCAN_RECIPES_COLLECTION_NAME is not defined in process environment");
	
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
	await client.connect();

	const db: mongoDB.Db = client.db(process.env.DB_NAME);

	collections.users = db.collection(process.env.USERS_COLLECTION_NAME);
	collections.recipes = db.collection(process.env.RECIPES_COLLECTION_NAME);
	collections.saved_recipes = db.collection(process.env.SAVED_RECIPES_COLLECTION_NAME);
	collections.ingredient_scans = db.collection(process.env.INGREDIENT_SCANS_COLLECTION_NAME);
	collections.scan_recipes = db.collection(process.env.SCAN_RECIPES_COLLECTION_NAME);

	console.log("Successfully connected to database");
}