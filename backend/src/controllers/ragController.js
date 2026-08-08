import { eq, and } from "drizzle-orm";
import { db } from "../config/db.js";
import { documents } from "../db/schema.js";
import { indexDocument } from "../services/embeddingService.js";

export const indexDocumentController = async (request, reply) => {
  const { id } = request.params;

  const doc = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, request.user.id)));

  if (doc.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  try {
    const result = await indexDocument(id);
    return reply.status(200).send({ message: "Document indexed", ...result });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to index document" });
  }
};
