import "dotenv/config";
import express from "express";
import cors from "cors";
import webhookRouter from "./webhook.js";
import apiRouter from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Twilio sends form-encoded

// Routes
app.use("/webhook", webhookRouter);
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Handly server running on http://localhost:${PORT}`);
});
