import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const documentRoutes = async (app) => {
  app.post("/api/v1/documents", { preHandler: authMiddleware }, uploadDocument);
  app.get("/api/v1/documents", { preHandler: authMiddleware }, getDocuments);
  app.get("/api/v1/documents/:id", { preHandler: authMiddleware }, getDocumentById);
  app.put("/api/v1/documents/:id", { preHandler: authMiddleware }, updateDocument);
  app.delete("/api/v1/documents/:id", { preHandler: authMiddleware }, deleteDocument);
};
