import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, reuse the global promise to prevent multiple connections
  if (!globalThis.hasOwnProperty("_mongoClientPromise")) {
    client = new MongoClient(uri, options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)._mongoClientPromise = client.connect(); // Assign connection promise to global variable
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientPromise = (globalThis as any)._mongoClientPromise; // Use the existing promise
} else {
  // In production mode, create a new MongoClient for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect(); // Connect for production
}

// Function to connect to the database
export async function connectToDatabase() {
  const client = await clientPromise;
  await client.db("admin").command({ ping: 1 });
  console.log("Successfully connected to MongoDB!");
  return client;
}
