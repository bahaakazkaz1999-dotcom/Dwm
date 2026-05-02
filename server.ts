import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Path to dist folder
const __dirname = process.cwd();
const distPath = path.join(__dirname, "dist");

// Serve static files
app.use(express.static(distPath));

// Catch-all route for React
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
