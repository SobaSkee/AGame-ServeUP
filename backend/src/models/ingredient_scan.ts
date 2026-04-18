import { UserId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class IngredientScan implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public ingredients_found: string[],
        public user_id: UserId_FK, 
        public scan_id?: ObjectId
    ) {}
}