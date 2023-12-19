import mongoose from "mongoose";
import { Probot } from "probot";

async function connectDb(app: Probot): Promise<mongoose.Connection> {
  try {
    const db = await mongoose.connect("");
    app.log.info("Connected to the database successfully");

    return db.connection;
  } catch (error: any) {
    app.log.error(
      `Error occurred while trying to connect to the database: ${error}`
    );
    throw error;
  }
}

export default connectDb;
