import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
});

app.get("/healthcheck", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

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
