import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import "dotenv/config";
import { authRoutes } from "./routes/authRoutes.js";
import { documentRoutes } from "./routes/documentRoutes.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
});

await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.get("/healthcheck", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

await app.register(authRoutes);
await app.register(documentRoutes);

const start = async () => {
  try {
    const port = process.env.PORT || 5000;
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
