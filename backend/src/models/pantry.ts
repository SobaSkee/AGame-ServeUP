import { RecipeId_FK, UserId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class Pantry implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public last_updated: Date,
        public user_id: UserId_FK,
        public ingredients: { name: string, amount: string | null }[],
        public _id?: ObjectId
    ) {}
}