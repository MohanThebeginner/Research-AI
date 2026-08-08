import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const dashboardRoutes = async (app) => {
  app.get("/api/v1/dashboard/stats", { preHandler: authMiddleware }, getDashboardStats);
};
