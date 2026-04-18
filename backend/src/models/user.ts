import { Document, ObjectId } from "mongodb";

export default class User implements Document {
    [key: string]: unknown;
	constructor(
        public created_at: Date, 
        public last_login: Date, 
		public email: string, 
        public user_id?: ObjectId
	) {}
}