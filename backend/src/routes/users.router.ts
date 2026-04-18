import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import User from "../models/user";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.get("/", async (_req: Request, res: Response) => {
	try {
		if (!collections.users) throw new Error("Could not bind to users collection");

		const users = (await collections.users.find({}).toArray()) as User[];
		res.status(200).send(users);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(500).send(error_msg);
	}
});

usersRouter.get("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.users) throw new Error("Could not bind to users collection");

		const query = { _id: new ObjectId(id) };
		const user = (await collections.users.findOne(query)) as User;
		if (user) {
			res.status(200).send(user);
		}
	}
	catch (error) {
		res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
	}
});

usersRouter.post("/", async (req: Request, res: Response) => {
	try {
		if (!collections.users) throw new Error("Could not bind to users collection");

		const newUser = req.body as User;
		const result = (await collections.users.insertOne(newUser));
		result ? 
			res.status(201).send(`Successfully created a new user with id ${result.insertedId}`) : 
			res.status(500).send("Failed to create a new user");
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

usersRouter.put("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.users) throw new Error("Could not bind to users collection");

		const updatedUser: User = req.body as User;
		const query = { _id: new ObjectId(id) };
		const result = await collections.users.updateOne(query, { $set: updatedUser });
		result ?
			res.status(200).send(`Successfully updated user with id ${id}`) :
			res.status(304).send(`DbUser with id: ${id} not updated`);
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});

usersRouter.delete("/:id", async (req: Request, res: Response) => {
	const id = req?.params?.id;
	try {
		if (!collections.users) throw new Error("Could not bind to users collection");

		const query = { _id: new ObjectId(id) };
		const result = await collections.users.deleteOne(query);
		if (result && result.deletedCount) {
			res.status(202).send(`Successfully removed user with id ${id}`);
		}
		else if (!result) {
			res.status(400).send(`Failed to remove user with id ${id}`);
		}
		else if (!result.deletedCount) {
			res.status(404).send(`User with id ${id} does not exist`);
		}
	}
	catch (error) {
		var error_msg = (error instanceof Error) ? error.message : "An unknown error occurred";
		console.error(error_msg);
		res.status(400).send(error_msg);
	}
});