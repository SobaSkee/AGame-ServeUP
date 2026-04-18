import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import SavedRecipe from "../models/saved_recipes";

export const savedRecipesRouter = express.Router();

savedRecipesRouter.use(express.json());

savedRecipesRouter.get("/", async (_req: Request, res: Response) => {
	try {
		if (!collections.saved_recipes) throw new Error("Could not bind to saved_recipes collection");

		const saved_recipes = (await collections.saved_recipes.find({}).toArray()) as SavedRecipe[];
		res.status(200).send(saved_recipes);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(500).send(error_msg);
	}
});

savedRecipesRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.saved_recipes) throw new Error("Could not bind to saved_recipes collection");

		const query = { _id: new ObjectId(id) };
		const saved_recipe = (await collections.saved_recipes.findOne(query)) as SavedRecipe;
		if (saved_recipe) {
			res.status(200).send(saved_recipe);
		}
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

savedRecipesRouter.post("/", async (req: Request, res: Response) => {
	try {
		if (!collections.saved_recipes) throw new Error("Could not bind to saved_recipes collection");

		const newUser = req.body as SavedRecipe;
		const result = (await collections.saved_recipes.insertOne(newUser));
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

savedRecipesRouter.put("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.saved_recipes) throw new Error("Could not bind to saved_recipes collection");

		const updatedUser: SavedRecipe = req.body as SavedRecipe;
		const query = { _id: new ObjectId(id) };
		const result = await collections.saved_recipes.updateOne(query, { $set: updatedUser });
		result ?
			res.status(200).send(`Successfully updated recipe with id ${id}`) :
			res.status(304).send(`SavedRecipe with id: ${id} not updated`);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

savedRecipesRouter.delete("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.saved_recipes) throw new Error("Could not bind to saved_recipes collection");

		const query = { _id: new ObjectId(id) };
		const result = await collections.saved_recipes.deleteOne(query);
		if (result && result.deletedCount) {
			res.status(202).send(`Successfully removed recipe with id ${id}`);
		}
		else if (!result) {
			res.status(400).send(`Failed to remove recipe with id ${id}`);
		}
		else if (!result.deletedCount) {
			res.status(404).send(`SavedRecipe with id ${id} does not exist`);
		}
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});