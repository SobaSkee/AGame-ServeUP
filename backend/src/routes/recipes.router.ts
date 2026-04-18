import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { serveup_db_collections } from "../services/database.service";
import Recipe from "../models/recipe";

export const recipesRouter = express.Router();

recipesRouter.use(express.json());

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

recipesRouter.get("/", async (_req: Request, res: Response) => {
	const recipesCollection = collections.recipes;
	if (!recipesCollection) {
		res.status(503).send("Recipes collection is not available");
		return;
	}
	try {
		const recipes = await recipesCollection.find({}).toArray();
		res.status(200).send(recipes);
	}
	catch (error) {
		res.status(500).send(getErrorMessage(error));
	}
});

recipesRouter.get("/:id", async (req: Request, res: Response) => {
	const recipesCollection = collections.recipes;
	if (!recipesCollection) {
		res.status(503).send("Recipes collection is not available");
		return;
	}
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.recipes) throw new Error("Could not bind to recipes collection");

		const query = { _id: new ObjectId(id) };
		const recipe = await recipesCollection.findOne(query);
		if (recipe) {
			res.status(200).send(recipe);
			return;
		}
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

recipesRouter.post("/", async (req: Request, res: Response) => {
	const recipesCollection = collections.recipes;
	if (!recipesCollection) {
		res.status(503).send("Recipes collection is not available");
		return;
	}
	try {
		if (!serveup_db_collections.recipes) throw new Error("Could not bind to recipes collection");

		const newRecipe = req.body as Recipe;
		const result = await recipesCollection.insertOne(newRecipe);
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

recipesRouter.put("/:id", async (req: Request, res: Response) => {
	const recipesCollection = collections.recipes;
	if (!recipesCollection) {
		res.status(503).send("Recipes collection is not available");
		return;
	}
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.recipes) throw new Error("Could not bind to recipes collection");

		const updatedRecipe: Recipe = req.body as Recipe;
		const query = { _id: new ObjectId(id) };
		const result = await recipesCollection.updateOne(query, { $set: updatedRecipe });
		result ?
			res.status(200).send(`Successfully updated recipe with id ${id}`) :
			res.status(304).send(`Recipe with id: ${id} not updated`);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

recipesRouter.delete("/:id", async (req: Request, res: Response) => {
	const recipesCollection = collections.recipes;
	if (!recipesCollection) {
		res.status(503).send("Recipes collection is not available");
		return;
	}
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.recipes) throw new Error("Could not bind to recipes collection");

		const query = { _id: new ObjectId(id) };
		const result = await recipesCollection.deleteOne(query);
		if (result && result.deletedCount) {
			res.status(202).send(`Successfully removed recipe with id ${id}`);
		}
		else if (!result) {
			res.status(400).send(`Failed to remove recipe with id ${id}`);
		}
		else if (!result.deletedCount) {
			res.status(404).send(`Recipe with id ${id} does not exist`);
		}
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});