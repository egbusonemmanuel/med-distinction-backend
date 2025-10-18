import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(",");

export function checkAdmin(req, res, next) {
  if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}
