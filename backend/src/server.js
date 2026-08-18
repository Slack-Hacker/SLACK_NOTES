import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Cors Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost",
        "https://localhost",
        "capacitor://localhost",
    ],
    credentials: true,
}));

// Body Parsing Middleware (Up to 15MB for image uploads)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Upstash Rate Limiter (fails open safely if connection fails)
app.use(rateLimiter);

// API Routes
app.use("/api/notes", notesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "SlackNotes Server API is healthy 🚀" });
});

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

let server;

const startServer = async () => {
    await connectDB();
    
    server = app.listen(PORT, () => {
        console.log(`🚀 Server started on PORT: ${PORT}`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`❌ PORT ${PORT} is currently in use by another running instance.`);
            process.exit(1);
        } else {
            console.error("Server startup error:", err);
        }
    });
};

startServer();

// Graceful Shutdown on Nodemon Restarts & Process Termination
const gracefulShutdown = () => {
    if (server) {
        server.close(() => {
            console.log("HTTP server closed gracefully.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.once("SIGUSR2", gracefulShutdown);
