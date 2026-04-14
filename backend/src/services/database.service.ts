import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: {
	recipes?: mongoDB.Collection;
	ingredientScans?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
	dotenv.config();
	const uri = process.env.DB_CONN_STRING?.trim();
	if (!uri) {
		console.warn("DB_CONN_STRING not set — skipping MongoDB (optional). /recipes CRUD unavailable.");
		return;
	}
	try {
		const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);
		await client.connect();
		const db: mongoDB.Db = client.db(process.env.DB_NAME ?? "serve_up");
		const recipesCollection: mongoDB.Collection = db.collection(process.env.RECIPES_COLLECTION_NAME ?? "recipes");
		collections.recipes = recipesCollection;
		const scansName = process.env.INGREDIENT_SCANS_COLLECTION_NAME ?? "ingredientScans";
		collections.ingredientScans = db.collection(scansName);
		console.log("Successfully connected to database");
	} catch (e) {
		console.warn("MongoDB connection failed, continuing without database:", e);
	}
}