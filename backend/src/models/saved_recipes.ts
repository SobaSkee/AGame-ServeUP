import { RecipeId_FK, UserId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class SavedRecipe implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public title: string,
        public description: string,
        public ingredients: { name: string, amount: string | null }[],
        public instructions: { step: number, instruction: string }[],
        public prep_time: string,
        public cook_time: string | null,
        public servings: string | null,
        public difficulty: string,
        public cuisine: string | null,
        public image_url: string | null,
        public source_id: string,
        public is_spoonacular: boolean,
        public user_id?: UserId_FK,
        public _id?: ObjectId
    ) {}
}