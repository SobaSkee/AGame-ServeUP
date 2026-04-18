import { UserId_FK } from "./types"
import { Document, ObjectId } from "mongodb";

export default class IngredientScan implements Document {
    [key: string]: unknown;
    constructor(
        public user_id: UserId_FK, 
        public image_url: string,
        public ingredients_detected: string[],
        public created_at: Date, 
        public _id?: ObjectId
    ) {}
}