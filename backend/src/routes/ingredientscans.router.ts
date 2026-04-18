import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { serveup_db_collections } from "../services/database.service";
import IngredientScan from "../models/ingredient_scan";

export const ingredientScansRouter = express.Router();

ingredientScansRouter.use(express.json());

ingredientScansRouter.get("/", async (_req: Request, res: Response) => {
	try {
		if (!serveup_db_collections.ingredient_scans) throw new Error("Could not bind to ingredient_scans collection");

		const ingredient_scans = (await serveup_db_collections.ingredient_scans.find({}).toArray()) as IngredientScan[];
		res.status(200).send(ingredient_scans);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(500).send(error_msg);
	}
});

ingredientScansRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.ingredient_scans) throw new Error("Could not bind to ingredient_scans collection");

		const query = { _id: new ObjectId(id) };
		const ingredient_scan = (await serveup_db_collections.ingredient_scans.findOne(query)) as IngredientScan;
		if (ingredient_scan) {
			res.status(200).send(ingredient_scan);
		}
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

ingredientScansRouter.post("/", async (req: Request, res: Response) => {
	try {
		if (!serveup_db_collections.ingredient_scans) throw new Error("Could not bind to ingredient_scans collection");

		const newUser = req.body as IngredientScan;
		const result = (await serveup_db_collections.ingredient_scans.insertOne(newUser));
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

ingredientScansRouter.put("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.ingredient_scans) throw new Error("Could not bind to ingredient_scans collection");

		const updatedUser: IngredientScan = req.body as IngredientScan;
		const query = { _id: new ObjectId(id) };
		const result = await serveup_db_collections.ingredient_scans.updateOne(query, { $set: updatedUser });
		result ?
			res.status(200).send(`Successfully updated recipe with id ${id}`) :
			res.status(304).send(`IngredientScan with id: ${id} not updated`);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

ingredientScansRouter.delete("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!serveup_db_collections.ingredient_scans) throw new Error("Could not bind to ingredient_scans collection");

		const query = { _id: new ObjectId(id) };
		const result = await serveup_db_collections.ingredient_scans.deleteOne(query);
		if (result && result.deletedCount) {
			res.status(202).send(`Successfully removed recipe with id ${id}`);
		}
		else if (!result) {
			res.status(400).send(`Failed to remove recipe with id ${id}`);
		}
		else if (!result.deletedCount) {
			res.status(404).send(`IngredientScan with id ${id} does not exist`);
		}
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});