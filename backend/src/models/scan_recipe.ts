import { IngredientScanId_FK, RecipeId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class ScanRecipe implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public scan_id: IngredientScanId_FK, 
        public recipe_id: RecipeId_FK,
        public scanrecipe_id?: ObjectId
    ) {}
}