import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load env
dotenv.config();

// Routes
import authRoutes from "./Routes/auth.routes.js";
import publicRoutes from "./Routes/public.routes.js";
import metaRoutes from "./Routes/meta.routes.js";
import discoverRoutes from "./Routes/discover.routes.js";
import campaignRoutes from "./Routes/campaign.routes.js";
import reviewRoutes from "./Routes/review.routes.js";
import profileRoutes from "./routes/profile.routes.js";

// App init
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Influex Backend API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/profile", profileRoutes);
// MongoDB connect
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
