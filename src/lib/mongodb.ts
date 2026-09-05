import { MongoClient } from "mongodb";
import * as fs from "fs";

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
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000
};

let clientPromise: Promise<MongoClient>;

function createClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    return Promise.reject(new Error('Missing "DATABASE_URL" in .env'));
  }
  const client = new MongoClient(uri, options);
  const promise = client.connect();
  
  // Reset cached promise on failure so next request can retry with updated credentials
  promise.catch(() => {
    if (process.env.NODE_ENV === "development") {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };
      globalWithMongo._mongoClientPromise = undefined;
    }
  });

  return promise;
}

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClientPromise();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
