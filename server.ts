import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Initialize Database
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      role TEXT DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      beneficiaryName TEXT,
      targetAmount REAL,
      collectedAmount REAL DEFAULT 0,
      currency TEXT,
      status TEXT DEFAULT 'pending',
      authorId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS case_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseId TEXT,
      url TEXT,
      type TEXT,
      FOREIGN KEY (caseId) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      amount REAL,
      currency TEXT,
      donorId TEXT,
      donorName TEXT,
      paymentProof TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (caseId) REFERENCES cases(id)
    );
  `);

  // --- API Routes ---

  // Auth (Simplified for demo - in production use real OAuth/JWT)
  app.post("/api/auth/profile", async (req, res) => {
    const { uid, name, email } = req.body;
    let user = await db.get("SELECT * FROM users WHERE uid = ?", [uid]);
    
    if (!user) {
      const role = email === 'bahaakazkaz1999@gmail.com' ? 'admin' : 'user';
      await db.run(
        "INSERT INTO users (uid, name, email, role) VALUES (?, ?, ?, ?)",
        [uid, name, email, role]
      );
      user = { uid, name, email, role };
    }
    res.json(user);
  });

  // Cases
  app.get("/api/cases", async (req, res) => {
    const cases = await db.all("SELECT * FROM cases ORDER BY createdAt DESC");
    for (const c of cases) {
      c.evidence = await db.all("SELECT url, type FROM case_evidence WHERE caseId = ?", [c.id]);
    }
    res.json(cases);
  });

  app.post("/api/cases", async (req, res) => {
    const { id, title, description, beneficiaryName, targetAmount, currency, authorId } = req.body;
    await db.run(
      "INSERT INTO cases (id, title, description, beneficiaryName, targetAmount, currency, authorId) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, title, description, beneficiaryName, targetAmount, currency, authorId]
    );
    res.json({ id, status: 'pending' });
  });

  app.patch("/api/cases/:id", async (req, res) => {
    const { status, evidence } = req.body;
    if (status) {
      await db.run("UPDATE cases SET status = ? WHERE id = ?", [status, req.params.id]);
    }
    if (evidence && Array.isArray(evidence)) {
      for (const ev of evidence) {
        await db.run("INSERT INTO case_evidence (caseId, url, type) VALUES (?, ?, ?)", [req.params.id, ev.url, ev.type]);
      }
    }
    res.json({ success: true });
  });

  // Donations
  app.get("/api/donations", async (req, res) => {
    const donations = await db.all("SELECT * FROM donations ORDER BY createdAt DESC");
    res.json(donations);
  });

  app.post("/api/donations", async (req, res) => {
    const { id, caseId, amount, currency, donorId, donorName, paymentProof } = req.body;
    await db.run(
      "INSERT INTO donations (id, caseId, amount, currency, donorId, donorName, paymentProof) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, caseId, amount, currency, donorId, donorName, paymentProof]
    );
    res.json({ id, status: 'pending' });
  });

  app.post("/api/donations/:id/confirm", async (req, res) => {
    const donation = await db.get("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (donation && donation.status === 'pending') {
      await db.run("UPDATE donations SET status = 'confirmed' WHERE id = ?", [req.params.id]);
      await db.run(
        "UPDATE cases SET collectedAmount = collectedAmount + ? WHERE id = ?",
        [donation.amount, donation.caseId]
      );
      
      // Update case status if target reached
      const caseData = await db.get("SELECT * FROM cases WHERE id = ?", [donation.caseId]);
      if (caseData.collectedAmount >= caseData.targetAmount) {
        await db.run("UPDATE cases SET status = 'completed' WHERE id = ?", [donation.caseId]);
      }
    }
    res.json({ success: true });
  });

  app.post("/api/donations/:id/reject", async (req, res) => {
    await db.run("UPDATE donations SET status = 'rejected' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const leaderboard = await db.all(`
      SELECT 
        u.uid, u.name, 
        SUM(CASE WHEN d.currency = 'SYP' THEN d.amount ELSE 0 END) as sypTotal,
        SUM(CASE WHEN d.currency = 'USD' THEN d.amount ELSE 0 END) as usdTotal,
        COUNT(d.id) as count
      FROM users u
      JOIN donations d ON u.uid = d.donorId
      WHERE d.status = 'confirmed'
      GROUP BY u.uid
      ORDER BY usdTotal DESC, sypTotal DESC
    `);
    res.json(leaderboard);
  });

  // --- Vite / Frontend Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
