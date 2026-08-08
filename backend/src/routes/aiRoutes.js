import {
  summarizeDocument,
  chatWithDocument,
  getChatHistory,
} from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const aiRoutes = async (app) => {
  app.post(
    "/api/v1/ai/summarize/:documentId",
    { preHandler: authMiddleware },
    summarizeDocument
  );
  app.post("/api/v1/ai/chat/:documentId", { preHandler: authMiddleware }, chatWithDocument);
  app.get("/api/v1/ai/history/:documentId", { preHandler: authMiddleware }, getChatHistory);
};
