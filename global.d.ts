// global.d.ts
import { MongoClient } from "mongodb";

declare global {
  let _mongoClientPromise: Promise<MongoClient> | undefined; // Declare the global variable
}

export {};
