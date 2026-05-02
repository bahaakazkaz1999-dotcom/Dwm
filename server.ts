import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

// المسار الصحيح داخل Railway
const distPath = path.join(process.cwd(), "dist");

// تأكد إنو dist موجود
app.use(express.static(distPath));

// fallback لكل المسارات
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
