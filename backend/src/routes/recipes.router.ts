import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Recipe from "../models/recipe";

export const recipesRouter = express.Router();
recipesRouter.use(express.json());

recipesRouter.get("/", async (_req: Request, res: Response) => {
	try {
		const recipes = (await collections.recipes.find({}).toArray()) as Recipe[];
		res.status(200).send(recipes);
	}
	catch (error) {
		res.status(500).send(error.message);
	}
});

recipesRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		const query = { _id: new ObjectId(id) };
		const recipe = (await collections.recipes.findOne(query)) as Recipe;
		if (recipe) {
			res.status(200).send(recipe);
		}
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

recipesRouter.post("/", async (req: Request, res: Response) => {
	try {
		const newRecipe = req.body as Recipe;
		const result = (await collections.recipes.insertOne(newRecipe));
		result ? 
			res.status(201).send(`Successfully created a new recipe with id ${result.insertedId}`) : 
			res.status(500).send("Failed to create a new recipe");
	}
	catch (error) {
		console.error(error.message);
		res.status(400).send(error.message);
	}
});

recipesRouter.put("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		const updatedRecipe: Recipe = req.body as Recipe;
		const query = { _id: new ObjectId(id) };
		const result = await collections.recipes.updateOne(query, { $set: updatedRecipe });
		result ?
			res.status(200).send(`Successfully updated recipe with id ${id}`) :
			res.status(304).send(`Recipe with id: ${id} not updated`);
	}
	catch (error) {
		console.error(error.message);
		res.status(400).send(error.message);
	}
});

recipesRouter.delete("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		const query = { _id: new ObjectId(id) };
		const result = await collections.recipes.deleteOne(query);
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
		console.error(error.message);
		res.status(400).send(error.message);
	}
});