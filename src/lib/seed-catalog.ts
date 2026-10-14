import clientPromise, { getSellerProductsCollection } from "./mongodb";

export const SEED_PRODUCTS: any[] = [];

export const SEED_PORTFOLIOS: any[] = [];

/**
 * Automatic catalog seeding is disabled to maintain complete database cleanliness.
 */
export async function ensureSeedProductsInDatabase() {
  return;
}
