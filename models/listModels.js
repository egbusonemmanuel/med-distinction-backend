// models/listModels.js
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from "url";

// =====================
// Resolve __dirname in ES modules
// =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// Load .env from project root
// =====================
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// =====================
// Check API key
// =====================
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

// =====================
// Initialize GoogleGenerativeAI
// =====================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =====================
// List models
// =====================
async function main() {
  try {
    const response = await genAI.models.list(); // correct method in latest SDK
    console.log("✅ Available Gemini models:");
    response.models.forEach((m) => console.log("-", m.name));
  } catch (err) {
    console.error("❌ Error listing models:", err);
  }
}

main();
