import { Document, ObjectId } from "mongodb";
import { UserId_FK } from "./types";

export default class Session implements Document {
    [key: string]: unknown;
    constructor(
        public created_at: Date, 
        public expiration: Date,
        public token: string,
        public user_id: UserId_FK,
        public _id?: ObjectId
    ) {}
}