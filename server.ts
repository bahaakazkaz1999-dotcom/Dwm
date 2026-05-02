import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cors());

  // Initialize Database (better-sqlite3)
  const db = new Database("./database.sqlite");

  // Create tables
  db.exec(`
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

  // Auth
  app.post("/api/auth/profile", (req, res) => {
    const { uid, name, email } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE uid = ?").get(uid);

    if (!user) {
      const role = email === "bahaakazkaz1999@gmail.com" ? "admin" : "user";
      db.prepare(
        "INSERT INTO users (uid, name, email, role) VALUES (?, ?, ?, ?)"
      ).run(uid, name, email, role);
      user = { uid, name, email, role };
    }

    res.json(user);
  });

  // Cases
  app.get("/api/cases", (req, res) => {
    const cases = db.prepare("SELECT * FROM cases ORDER BY createdAt DESC").all();
    for (const c of cases) {
      c.evidence = db
        .prepare("SELECT url, type FROM case_evidence WHERE caseId = ?")
        .all(c.id);
    }
    res.json(cases);
  });

  app.post("/api/cases", (req, res) => {
    const { id, title, description, beneficiaryName, targetAmount, currency, authorId } =
      req.body;

    db.prepare(
      "INSERT INTO cases (id, title, description, beneficiaryName, targetAmount, currency, authorId) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, title, description, beneficiaryName, targetAmount, currency, authorId);

    res.json({ id, status: "pending" });
  });

  app.patch("/api/cases/:id", (req, res) => {
    const { status, evidence } = req.body;

    if (status) {
      db.prepare("UPDATE cases SET status = ? WHERE id = ?").run(status, req.params.id);
    }

    if (evidence && Array.isArray(evidence)) {
      const stmt = db.prepare(
        "INSERT INTO case_evidence (caseId, url, type) VALUES (?, ?, ?)"
      );
      for (const ev of evidence) {
        stmt.run(req.params.id, ev.url, ev.type);
      }
    }

    res.json({ success: true });
  });

  // Donations
  app.get("/api/donations", (req, res) => {
    const donations = db.prepare("SELECT * FROM donations ORDER BY createdAt DESC").all();
    res.json(donations);
  });

  app.post("/api/donations", (req, res) => {
    const { id, caseId, amount, currency, donorId, donorName, paymentProof } = req.body;

    db.prepare(
      "INSERT INTO donations (id, caseId, amount, currency, donorId, donorName, paymentProof) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, caseId, amount, currency, donorId, donorName, paymentProof);

    res.json({ id, status: "pending" });
  });

  app.post("/api/donations/:id/confirm", (req, res) => {
    const donation = db.prepare("SELECT * FROM donations WHERE id = ?").get(req.params.id);

    if (donation && donation.status === "pending") {
      db.prepare("UPDATE donations SET status = 'confirmed' WHERE id = ?").run(req.params.id);

      db.prepare(
        "UPDATE cases SET collectedAmount = collectedAmount + ? WHERE id = ?"
      ).run(donation.amount, donation.caseId);

      const caseData = db.prepare("SELECT * FROM cases WHERE id = ?").get(donation.caseId);

      if (caseData.collectedAmount >= caseData.targetAmount) {
        db.prepare("UPDATE cases SET status = 'completed' WHERE id = ?").run(donation.caseId);
      }
    }

    res.json({ success: true });
  });

  app.post("/api/donations/:id/reject", (req, res) => {
    db.prepare("UPDATE donations SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Leaderboard
  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = db
      .prepare(
        `
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
    `
      )
      .all();

    res.json(leaderboard);
  });

  // Frontend
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
