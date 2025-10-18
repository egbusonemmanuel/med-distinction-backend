import { MongoClient } from "mongodb";

const uri = "mongodb+srv://egbusonemmanuel4_db_user:<db_password>@cluster0.pivrb8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // replace with the connection string from Atlas
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (db) return db; // return existing connection
  try {
    await client.connect();
    db = client.db("egbusonemmanuel4"); // replace with your DB name
    console.log("MongoDB connected!");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
