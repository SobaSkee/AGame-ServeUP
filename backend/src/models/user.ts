import { Document, ObjectId } from "mongodb";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export default class DbUser implements Document {
    [key: string]: unknown;
	constructor(
        public created_at: Date, 
        public last_login: Date, 
		public email: string, 
        public user_id?: ObjectId
	) {}
}