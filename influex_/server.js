import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import metaRoutes from "./Routes/meta.routes.js";
import campaignRoutes from "./Routes/campaign.routes.js";
import applicationRoutes from "./Routes/application.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { connectDB } from "./config/db.js";

const app = express();

/* ------------------ DB ------------------ */
connectDB();

/* ------------------ MIDDLEWARES ------------------ */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* ------------------ ROUTES ------------------ */

// Auth
app.use("/auth", authRoutes);

// Public (Home page)
app.use("/public", publicRoutes);

// Meta (Cities, future dropdowns)
app.use("/meta", metaRoutes);

// Campaigns (Create, Match, Complete, Applications list)
app.use("/campaigns", campaignRoutes);

// Applications (Apply, Accept/Reject)
app.use("/applications", applicationRoutes);

// Reviews
app.use("/reviews", reviewRoutes);

app.use("/auth", authRoutes);

/* ------------------ HEALTH CHECK ------------------ */
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

/* ------------------ SERVER ------------------ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





