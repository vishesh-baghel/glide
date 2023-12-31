import mongoose from "mongoose";
import { Probot } from "probot";

const connectionString = process.env.MONGODB_CONNECTION_STRING;

export async function connectDb(app: Probot): Promise<mongoose.Connection> {
  try {
    if (!connectionString) {
      const errorMessage = "MongoDB connection string is not defined.";
      app.log.error(errorMessage);
      throw new Error(errorMessage);
    }

    const db = await mongoose.connect(connectionString);
    app.log.info("Connected to the database successfully");

    return db.connection;
  } catch (error: any) {
    app.log.error(
      `Error occurred while trying to connect to the database: ${error}`
    );
    throw error;
  }
}
