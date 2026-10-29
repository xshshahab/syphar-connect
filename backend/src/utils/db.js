import mongoose from "mongoose";

const RETRY_MS = 5000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Connects to MongoDB. If the database cannot be reached it keeps trying every
// few seconds, so the API recovers on its own once the database is up (for
// example after starting mongod or allowing this server's IP in Atlas).
export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "ERROR: MONGO_URI is not set. Add it to backend/.env and restart the API."
    );
    return;
  }

  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log("MONGO DB connected successfully!");
      return;
    } catch (error) {
      // A malformed connection string never fixes itself; stop and say so.
      if (error.name === "MongoParseError" || /invalid (scheme|connection)/i.test(error.message)) {
        console.error(`ERROR: MONGO_URI is not a valid connection string: ${error.message}`);
        return;
      }

      console.error(
        `ERROR: could not connect to MongoDB (attempt ${attempt}): ${error.message}`
      );
      // the useful part: why each database server refused or timed out
      const servers = error.reason?.servers ? [...error.reason.servers.values()] : [];
      servers.forEach((server) => {
        if (server.error?.message) {
          console.error(`  - ${server.address}: ${server.error.message}`);
        }
      });
      console.error(
        `Check MONGO_URI in backend/.env and that the database accepts connections from this server. Retrying in ${
          RETRY_MS / 1000
        }s...`
      );
      await wait(RETRY_MS);
    }
  }
};
