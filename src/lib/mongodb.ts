import { MongoClient, Db, Collection } from "mongodb";
import * as fs from "fs";

export const DB_NAME = "Truedeal";

function getMongoUri(): string {
  let uri = process.env.DATABASE_URL;
  if (!uri) {
    try {
      const envFile = fs.readFileSync(".env", "utf-8");
      const m = envFile.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
      if (m) uri = m[1];
    } catch {}
  }
  return uri || "";
}

const options = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }
  if (!cachedPromise) {
    const uri = getMongoUri();
    if (!uri) {
      throw new Error('Missing "DATABASE_URL" in .env');
    }
    const client = new MongoClient(uri, options);
    cachedPromise = client.connect()
      .then((c) => {
        cachedClient = c;
        return c;
      })
      .catch((err) => {
        cachedPromise = null;
        cachedClient = null;
        throw err;
      });
  }
  return cachedPromise;
}

/**
 * Get the single Truedeal database
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

/**
 * Clean slug into a safe, valid collection name component
 */
export function cleanSellerSlug(slug: string): string {
  if (!slug) return "default";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "") || "store";
}

/**
 * Generate isolated collection name for a seller's products inside Truedeal DB
 * Examples:
 * - "anvreeality" -> "products_anvreeality"
 * - "ayurmor-more" -> "products_ayurmor_more"
 * - "nexus-store"  -> "products_nexus_store"
 */
export function getSellerProductCollectionName(slug?: string): string {
  if (!slug || slug === "all" || slug === "global" || slug === "master") {
    return "products";
  }
  const clean = cleanSellerSlug(slug);
  if (clean === "products" || clean === "default") {
    return "products";
  }
  return `products_${clean}`;
}

/**
 * Get the dedicated Collection instance for a specific seller's products
 */
export async function getSellerProductsCollection(slug?: string): Promise<Collection> {
  const db = await getDb();
  const collectionName = getSellerProductCollectionName(slug);
  return db.collection(collectionName);
}

/**
 * Retrieve all seller product collection names in Truedeal database
 */
export async function getAllSellerProductCollectionNames(): Promise<string[]> {
  try {
    const db = await getDb();
    const cols = await db.listCollections().toArray();
    const names = cols
      .map(c => c.name)
      .filter(name => name.startsWith("products_") || name === "products");
    
    // Ensure primary seller collections are present
    if (!names.includes("products_anvreeality")) names.push("products_anvreeality");
    if (!names.includes("products_ayurmor_more")) names.push("products_ayurmor_more");

    return Array.from(new Set(names));
  } catch (err: any) {
    console.error("Error listing seller product collections:", err.message);
    return ["products_anvreeality", "products_ayurmor_more", "products"];
  }
}

// Custom Thenable object for backward compatibility with `await clientPromise`
const clientPromise = {
  then: <TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ) => getMongoClient().then(onfulfilled, onrejected),
  catch: <TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ) => getMongoClient().catch(onrejected)
} as unknown as Promise<MongoClient>;

export default clientPromise;
