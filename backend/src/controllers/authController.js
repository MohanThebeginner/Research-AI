import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../utils/validators.js";

export const register = async (request, reply) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length > 0) {
    return reply.status(409).send({ message: "Email already registered" });
  }

  const passwordHash = await hashPassword(password);

  const newUser = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return reply.status(201).send({ user: newUser[0] });
};

export const login = async (request, reply) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length === 0) {
    return reply.status(401).send({ message: "Invalid email or password" });
  }

  const user = existingUser[0];

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return reply.status(401).send({ message: "Invalid email or password" });
  }

  const payload = { id: user.id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return reply.status(200).send({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

export const refresh = async (request, reply) => {
  const { refreshToken } = request.body || {};

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, role: decoded.role };
    const accessToken = generateAccessToken(payload);
    return reply.status(200).send({ accessToken });
  } catch (err) {
    return reply.status(401).send({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (request, reply) => {
  return reply.status(200).send({ message: "Logged out successfully" });
};

export const getMe = async (request, reply) => {
  const existingUser = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, request.user.id));

  if (existingUser.length === 0) {
    return reply.status(404).send({ message: "User not found" });
  }

  return reply.status(200).send({ user: existingUser[0] });
};
