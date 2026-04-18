import { SpoonacularId } from "./types"
import { Document, ObjectId } from "mongodb";

export default class Recipe {
	constructor(
		public created_at: Date, 
		public title: string, 
		public instructions: string, 
		public spoonacular_id?: SpoonacularId,
		public _id?: ObjectId
	) {}
}