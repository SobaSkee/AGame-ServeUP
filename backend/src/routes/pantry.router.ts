import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import ScanRecipe from "../models/scan_recipe";
import { validateTokenCookie } from "../services/session.service";
import { RecipeGenerationResult, Recipe, RecipeIngredient } from '../services/recipeGeneration';
import { findUserId } from "../services/user.service";
import { getUserPantry, createNewPantry, insertOrUpdatePantryItems, deletePantryItems } from "../services/pantry.service";

export const pantriesRouter = express.Router();
pantriesRouter.use(express.json());

pantriesRouter.get("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

		var user_pantry = await getUserPantry(session_info.user);
        if (user_pantry === null) {
            const creation_result = await createNewPantry(session_info.user);
            if (!creation_result.acknowledged) return res.status(404).json({ message: "Pantry not found" });
            user_pantry = await getUserPantry(session_info.user);
        }
        if (user_pantry === null) return res.status(404).json({ message: "Pantry not found" });

        const ingredients: RecipeIngredient[] = user_pantry.ingredients.map(
            ingredient => ingredient.amount ? 
            {name: ingredient.name, amount: ingredient.amount} :
            {name: ingredient.name}
        )

		return res.status(200).json({
			success: true,
			ingredients: ingredients,
		});
	} 
	catch(error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		res.status(500).json({
			success: false,
			error: errorMessage,
		});
	}
});

pantriesRouter.post("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

        const ingredients = req.body as RecipeIngredient[];
        const update_result = await insertOrUpdatePantryItems(session_info.user, ingredients);
        if (!update_result.acknowledged) return res.status(503).json({success: false, error: "Could not update user pantry"});

        const updated_pantry = await getUserPantry(session_info.user);
        if (!updated_pantry) return res.status(207).json({
            success: true,
            error: "Could not retrieve pantry after update",
        });

        const updated_ingredients: RecipeIngredient[] = updated_pantry.ingredients.map(
            ingredient => ingredient.amount ? 
            {name: ingredient.name, amount: ingredient.amount} :
            {name: ingredient.name}
        )

		return res.status(200).json({
            success: true,
            ingredients: updated_ingredients
        });
	} 
	catch(error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		res.status(500).json({
			success: false,
			error: errorMessage,
		});
	}
});

pantriesRouter.delete("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

		const ingredients = req.body as RecipeIngredient[];
        const ingredients_str_arr: string[] = ingredients.map(ingredient => ingredient.name);

        const update_result = await deletePantryItems(session_info.user, ingredients_str_arr);
        if (!update_result.acknowledged) return res.status(503).json({success: false, error: "Could not update user pantry"});

        const updated_pantry = await getUserPantry(session_info.user);
        if (!updated_pantry) return res.status(207).json({
            success: true,
            error: "Could not retrieve pantry after update",
        });

        const updated_ingredients: RecipeIngredient[] = updated_pantry.ingredients.map(
            ingredient => ingredient.amount ? 
            {name: ingredient.name, amount: ingredient.amount} :
            {name: ingredient.name}
        )

		return res.status(200).json({
            success: true,
            ingredients: updated_ingredients
        });
	} 
	catch(error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		res.status(500).json({
			success: false,
			error: errorMessage,
		});
	}
});