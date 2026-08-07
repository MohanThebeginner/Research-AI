import { register, login, refresh, logout, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const authRoutes = async (app) => {
  app.post("/api/v1/auth/register", register);
  app.post("/api/v1/auth/login", login);
  app.post("/api/v1/auth/refresh", refresh);
  app.post("/api/v1/auth/logout", logout);
  app.get("/api/v1/auth/me", { preHandler: authMiddleware }, getMe);
};
