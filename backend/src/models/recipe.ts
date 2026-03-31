import { ObjectId } from "mongodb";

export default class Recipe {
	constructor(public instructions: string, public id?: ObjectID) {}
}