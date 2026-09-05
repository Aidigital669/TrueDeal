import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  return handleWipe();
}

export async function POST() {
  return handleWipe();
}

async function handleWipe() {
  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ success: false, error: "Database client unavailable" }, { status: 500 });
    }

    const db = client.db();
    const collections = await db.listCollections().toArray();

    const results: Record<string, number> = {};
    let totalDeleted = 0;

    for (const col of collections) {
      try {
        const res = await db.collection(col.name).deleteMany({});
        results[col.name] = res.deletedCount;
        totalDeleted += res.deletedCount;
      } catch (err: any) {
        results[col.name] = -1;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully wiped ${totalDeleted} total document(s) from MongoDB database '${db.databaseName}'.`,
      databaseName: db.databaseName,
      totalDeleted,
      collections: results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
