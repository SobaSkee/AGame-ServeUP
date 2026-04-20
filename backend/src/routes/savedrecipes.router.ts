import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import ScanRecipe from "../models/scan_recipe";
import { validateTokenCookie } from "../services/session.service";
import { RecipeGenerationResult, Recipe } from '../services/recipeGeneration';
import { findUserId } from "../services/user.service";
import { getUserSavedRecipes, formatSavedRecipesForFrontendExport, saveRecipe, unsaveRecipe } from "../services/savedRecipe.service";

export const savedRecipesRouter = express.Router();
savedRecipesRouter.use(express.json());

savedRecipesRouter.get("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

		const saved_recipes = await getUserSavedRecipes(session_info.user);
		const recipes = await formatSavedRecipesForFrontendExport(saved_recipes, session_info.user);

		return res.status(200).json({
			success: true,
			recipes: recipes,
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

savedRecipesRouter.post("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

		const result = await saveRecipe(session_info.user, req.body as Recipe);
		if (!result) return res.status(400).json({success: false, error: "Could not save recipe"});
		if (!result.acknowledged) return res.status(503).json({success: false, error: "Could not save recipe"});

		return res.status(200);
	} 
	catch(error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		res.status(500).json({
			success: false,
			error: errorMessage,
		});
	}
});

savedRecipesRouter.delete("/", async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) { return res.status(401).json({ message: "Not logged in" }); }
		const session_info = await validateTokenCookie(token);
		if (!session_info.valid) return res.status(401).json({ message: "Invalid session" });
		if (!session_info.user) return res.status(401).json({ message: "Invalid user" });
		const user = await findUserId(session_info.user);
		if (!user) { return res.status(404).json({ message: "User not found" }); }

		const recipe = req.body as Recipe;
		const result = await unsaveRecipe(session_info.user, recipe.id);
		if (!result.acknowledged) return res.status(503).json({success: false, error: "Could not unsave recipe"});
		if (result.deletedCount == 0) return res.status(204).json({success: false, error: "Recipe not found"});

		return res.status(200);
	} 
	catch(error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		res.status(500).json({
			success: false,
			error: errorMessage,
		});
	}
});