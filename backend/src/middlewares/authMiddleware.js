import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ message: "Invalid or expired token" });
  }
};
