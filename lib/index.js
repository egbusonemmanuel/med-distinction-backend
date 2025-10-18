const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Example route
app.get("/api", (req, res) => {
  res.send("✅ Hello from Firebase Backend!");
});

// Add more routes below
// app.post("/api/data", (req, res) => {...});

exports.api = functions.https.onRequest(app);
