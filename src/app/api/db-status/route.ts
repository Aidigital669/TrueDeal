import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const startTime = Date.now();

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({
        success: false,
        status: "DISCONNECTED",
        error: "MongoClient instance is null or undefined.",
        pingMs: Date.now() - startTime
      }, { status: 500 });
    }

    const db = client.db();
    
    // Send ping command to MongoDB database
    const pingResult = await db.command({ ping: 1 });
    const pingMs = Date.now() - startTime;

    // Fetch collection info and document counts
    const collections = await db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (col) => {
        try {
          const count = await db.collection(col.name).countDocuments();
          return { name: col.name, documentCount: count };
        } catch {
          return { name: col.name, documentCount: 0 };
        }
      })
    );

    const totalDocuments = collectionStats.reduce((acc, c) => acc + c.documentCount, 0);

    return NextResponse.json({
      success: true,
      status: "CONNECTED",
      databaseName: db.databaseName,
      pingMs,
      pingResult,
      totalCollections: collections.length,
      totalDocuments,
      collections: collectionStats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const pingMs = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      status: "DISCONNECTED",
      error: error.message || "Failed to establish connection to MongoDB.",
      pingMs,
      troubleshooting: [
        "Verify your DATABASE_URL in .env",
        "Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0)",
        "Check database user permissions in MongoDB Atlas"
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
