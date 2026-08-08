import { pgTable, uuid, varchar, timestamp, text, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const uploadStatusEnum = pgEnum("upload_status", ["PENDING", "PROCESSING", "READY", "FAILED"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  storagePath: text("storage_path").notNull(),
  extractedText: text("extracted_text"),
  summary: text("summary"),
  uploadStatus: uploadStatusEnum("upload_status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
