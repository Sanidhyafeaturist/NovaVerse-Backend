const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// 🧠 Firebase Admin Init
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Multer (handle file uploads to /tmp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// 🌐 Upload Endpoint
app.post("/upload", upload.single("game"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("❌ No file uploaded.");

    const { username, title, description } = req.body;

    // Save game metadata to Firestore
    await db.collection("games").add({
      uploadedBy: username || "Unknown",
      title: title || "Untitled Game",
      description: description || "",
      fileName: req.file.filename,
      uploadTime: new Date()
    });

    console.log("✅ Game uploaded by:", username);
    res.send("✅ Upload successful.");
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).send("❌ Internal error.");
  }
});

// 🔄 Health check
app.get("/", (req, res) => {
  res.send("✅ NovaVerse Upload Server is live.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
