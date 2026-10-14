import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Dummy seed catalog emptied
const SEED_PRODUCTS = [];

async function run() {
  await client.connect();
  const db = client.db();
  console.log("Seed catalog is empty. Total products in MongoDB:", await db.collection("products").countDocuments());
  await client.close();
}

run().catch(console.error);
