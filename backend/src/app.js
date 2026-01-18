import express from "express";
import session from "express-session";
import cors from "cors";
import { createPublicRouter } from "./routes/public.js";
import { createAdminRouter } from "./routes/admin.js";

export function createApp({ db }) {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : true,
      credentials: true
    })
  );

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_session_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }
    })
  );

  app.use("/api/public", createPublicRouter({ db }));
  app.use("/api/admin", createAdminRouter({ db }));

  return app;
}