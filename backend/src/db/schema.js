import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
  integer,
  boolean,
  customType,
} from "drizzle-orm/pg-core";

export const vector = customType({
  dataType() {
    return "vector(768)";
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value) {
    return value.slice(1, -1).split(",").map(Number);
  },
});

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const uploadStatusEnum = pgEnum("upload_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);
export const senderEnum = pgEnum("sender", ["USER", "ASSISTANT"]);

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
  storageUrl: text("storage_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  extractedText: text("extracted_text"),
  summary: text("summary"),
  uploadStatus: uploadStatusEnum("upload_status").default("PENDING").notNull(),
  isIndexed: boolean("is_indexed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  sender: senderEnum("sender").notNull(),
  content: text("content").notNull(),
  tokens: integer("tokens"),
  latency: integer("latency"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const embeddings = pgTable("embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
