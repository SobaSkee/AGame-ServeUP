import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { serveup_db_collections } from "../services/database.service";
import ScanRecipe from "../models/scan_recipe";

export const scanRecipesRouter = express.Router();

scanRecipesRouter.use(express.json());

scanRecipesRouter.get("/", async (_req: Request, res: Response) => {
	try {
		if (!serveup_db_collections.scan_recipes) throw new Error("Could not bind to scan_recipes collection");

		const scan_recipes = (await serveup_db_collections.scan_recipes.find({}).toArray()) as ScanRecipe[];
		res.status(200).send(scan_recipes);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(500).send(error_msg);
	}
});

scanRecipesRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.scan_recipes) throw new Error("Could not bind to scan_recipes collection");

		const query = { _id: new ObjectId(id) };
		const scan_recipe = (await serveup_db_collections.scan_recipes.findOne(query)) as ScanRecipe;
		if (scan_recipe) {
			res.status(200).send(scan_recipe);
		}
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

scanRecipesRouter.post("/", async (req: Request, res: Response) => {
	try {
		if (!serveup_db_collections.scan_recipes) throw new Error("Could not bind to scan_recipes collection");

		const newUser = req.body as ScanRecipe;
		const result = (await serveup_db_collections.scan_recipes.insertOne(newUser));
		result ? 
			res.status(201).send(`Successfully created a new recipe with id ${result.insertedId}`) : 
			res.status(500).send("Failed to create a new recipe");
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

scanRecipesRouter.put("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.scan_recipes) throw new Error("Could not bind to scan_recipes collection");

		const updatedUser: ScanRecipe = req.body as ScanRecipe;
		const query = { _id: new ObjectId(id) };
		const result = await serveup_db_collections.scan_recipes.updateOne(query, { $set: updatedUser });
		result ?
			res.status(200).send(`Successfully updated recipe with id ${id}`) :
			res.status(304).send(`ScanRecipe with id: ${id} not updated`);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

scanRecipesRouter.delete("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.scan_recipes) throw new Error("Could not bind to scan_recipes collection");

		const query = { _id: new ObjectId(id) };
		const result = await serveup_db_collections.scan_recipes.deleteOne(query);
		if (result && result.deletedCount) {
			res.status(202).send(`Successfully removed recipe with id ${id}`);
		}
		else if (!result) {
			res.status(400).send(`Failed to remove recipe with id ${id}`);
		}
		else if (!result.deletedCount) {
			res.status(404).send(`ScanRecipe with id ${id} does not exist`);
		}
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});