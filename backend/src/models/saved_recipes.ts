import { RecipeId_FK, UserId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class SavedRecipe implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public user_id: UserId_FK,
        public recipe_id: RecipeId_FK,
        public scan_id?: ObjectId
    ) {}
}