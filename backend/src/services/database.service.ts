import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

import User from "../models/user"
import Session from "../models/session";
import Recipe from "../models/recipe"
import SavedRecipe from "../models/saved_recipes"
import IngredientScan from "../models/ingredient_scan"
import ScanRecipe from "../models/scan_recipe"
import Pantry from "../models/pantry"

export const collections: { 
	users?: mongoDB.Collection<User>,
	sessions?: mongoDB.Collection<Session>,
	recipes?: mongoDB.Collection<Recipe>,
	saved_recipes?: mongoDB.Collection<SavedRecipe>,
	ingredient_scans?: mongoDB.Collection<IngredientScan>,
	scan_recipes?: mongoDB.Collection<ScanRecipe>
	pantries?: mongoDB.Collection<Pantry>
} = {}

export async function connectToDatabase() {
	dotenv.config();
	if (!process.env.DB_NAME) throw new Error("DB_NAME is not defined in process environment");
	if (!process.env.DB_CONN_STRING) throw new Error("DB_CONN_STRING is not defined in process environment");
	if (!process.env.USERS_COLLECTION_NAME) throw new Error("USERS_COLLECTION_NAME is not defined in process environment");
	if (!process.env.SESSIONS_COLLECTION_NAME) throw new Error("SESSIONS_COLLECTION_NAME is not defined in process environment");
	if (!process.env.RECIPES_COLLECTION_NAME) throw new Error("RECIPES_COLLECTION_NAME is not defined in process environment");
	if (!process.env.SAVED_RECIPES_COLLECTION_NAME) throw new Error("SAVED_RECIPES_COLLECTION_NAME is not defined in process environment");
	if (!process.env.INGREDIENT_SCANS_COLLECTION_NAME) throw new Error("INGREDIENT_SCANS_COLLECTION_NAME is not defined in process environment");
	if (!process.env.SCAN_RECIPES_COLLECTION_NAME) throw new Error("SCAN_RECIPES_COLLECTION_NAME is not defined in process environment");
	if (!process.env.PANTRIES_COLLECTION_NAME) throw new Error("PANTRIES_COLLECTION_NAME is not defined in process environment");
	
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
	await client.connect();

	const db: mongoDB.Db = client.db(process.env.DB_NAME);

	console.log("Successfully connected to database");

	collections.users = db.collection(process.env.USERS_COLLECTION_NAME);
	collections.sessions = db.collection(process.env.SESSIONS_COLLECTION_NAME);
	collections.recipes = db.collection(process.env.RECIPES_COLLECTION_NAME);
	collections.saved_recipes = db.collection(process.env.SAVED_RECIPES_COLLECTION_NAME);
	collections.ingredient_scans = db.collection(process.env.INGREDIENT_SCANS_COLLECTION_NAME);
	collections.scan_recipes = db.collection(process.env.SCAN_RECIPES_COLLECTION_NAME);
	collections.pantries = db.collection(process.env.PANTRIES_COLLECTION_NAME);

	if (!collections.users) console.log("Failed to get 'users' collection");
	if (!collections.sessions) console.log("Failed to get 'sessions' collection");
	if (!collections.recipes) console.log("Failed to get 'recipes' collection");
	if (!collections.saved_recipes) console.log("Failed to get 'saved_recipes' collection");
	if (!collections.ingredient_scans) console.log("Failed to get 'ingredient_scans' collection");
	if (!collections.scan_recipes) console.log("Failed to get 'scan_recipes' collection");
	if (!collections.pantries) console.log("Failed to get 'pantries' collection");

	if (collections.users) await collections.users.createIndex({email: 1}, {unique: true}); // Indexes users by email for fast lookup
	if (collections.sessions) await collections.sessions.createIndex({expiration: 1}, {expireAfterSeconds: 0}); // Ensures that expired sessions are deleted after expiration
	if (collections.sessions) await collections.sessions.createIndex({token: 1}, {unique: true}); // Indexes sessions by token so they are fast to look up
	if (collections.pantries) await collections.pantries.createIndex({user_id: 1}, {unique: true}); // Indexes pantries by user FK for fast lookup
	if (collections.saved_recipes) await collections.saved_recipes.createIndex({source_id: 1}, {unique: true});
	if (collections.saved_recipes) await collections.saved_recipes.createIndex({user_id: 1}, {unique: true});
}