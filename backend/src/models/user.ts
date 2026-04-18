import { Document, ObjectId } from "mongodb";

export default class User implements Document {
    [key: string]: unknown;
	constructor(
        public created_at: Date, 
        public last_login: Date | null, 
        public name: string, 
		public email: string, 
        public password: string,
        public _id?: ObjectId
	) {}
}