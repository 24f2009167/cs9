import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const getMongoUri = () =>
  process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

const buildConnectOptions = (mongoUri) => {
  const options = {
    dbName: process.env.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };

  if (mongoUri.startsWith("mongodb+srv://") || mongoUri.startsWith("mongodb+tls://")) {
    options.tls = true;
    options.tlsAllowInvalidCertificates = false;
    options.tlsAllowInvalidHostnames = false;
  }

  return options;
};

const connectDB = async () => {
  let mongoUri = getMongoUri();
  let memoryServer;

  if (!mongoUri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MongoDB connection string is missing. Set MONGODB_URI in backend/.env."
      );
    }

    memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    console.log("Using in-memory MongoDB instance because no MONGO_URI was provided.");
  }

  if (mongoUri.startsWith("mongodb+srv://")) {
    const currentServers = dns.getServers();
    if (currentServers.some((server) => server === "127.0.0.1" || server === "::1")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log(
        `Overriding local DNS servers for SRV resolution: ${dns.getServers().join(", ")}`
      );
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri, buildConnectOptions(mongoUri));
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `MongoDB connection failed (${error.message}). Falling back to in-memory MongoDB.`
      );
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      const conn = await mongoose.connect(mongoUri, buildConnectOptions(mongoUri));
      console.log(`MongoDB connected with in-memory server: ${conn.connection.host}`);
      return conn;
    }

    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
