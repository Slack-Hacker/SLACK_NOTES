import mongoose from "mongoose";
import Note from "../models/Note.js";

const seedInitialNotes = async () => {
  try {
    const count = await Note.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding initial sample notes...");
      await Note.insertMany([
        {
          title: "Welcome to SlackNotes (by Slack-Hacker) ✨",
          content: "SlackNotes allows you to easily capture thoughts, attach screenshots, set real-time sound alarms, and share notes individually or in bulk!",
          isPinned: true,
          imageUrl: "",
        },
        {
          title: "Setting Alarm Reminders ⏰",
          content: "You can set an alarm for any note! Use quick presets like 'In 30 Mins', 'In 1 Hour', 'Tonight 8 PM', or pick custom future dates.",
          isPinned: false,
          reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: "Share & Export Notes 🚀",
          content: "Click the Share button on any note card or use the multi-select feature to export multiple notes via WhatsApp, Email, or download as a .txt file.",
          isPinned: false,
        }
      ]);
      console.log("✅ Initial sample notes seeded successfully!");
    }
  } catch (err) {
    // Silent catch
  }
};

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localFallbackUri = "mongodb://127.0.0.1:27017/slacknotes_db";

  // Attempt 1: Connect to Primary MONGO_URI (MongoDB Atlas)
  if (primaryUri) {
    try {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
        family: 4, // Force IPv4 for Windows DNS compatibility
      });
      console.log("✅ Connected to MongoDB Atlas successfully!");
      await seedInitialNotes();
      return;
    } catch (atlasErr) {
      console.warn("⚠️ MongoDB Atlas notice (IP restriction):", atlasErr.message);
      console.log("🔄 Switching to automatic fallback DB connection...");
    }
  }

  // Attempt 2: Connect to Local MongoDB
  try {
    console.log("Connecting to Local MongoDB (127.0.0.1:27017)...");
    await mongoose.connect(localFallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✅ Connected to Local MongoDB successfully!");
    await seedInitialNotes();
    return;
  } catch {
    // Silently fall through to In-Memory DB
  }

  // Attempt 3: In-Memory MongoDB Server Fallback
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    console.log("⚡ Starting In-Memory MongoDB Server fallback...");
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log("✅ Connected to In-Memory MongoDB Server successfully!");
    await seedInitialNotes();
  } catch (memoryErr) {
    console.error("❌ Database connection error:", memoryErr.message);
  }
};
