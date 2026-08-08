import { eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { documents, embeddings } from "../db/schema.js";
import { ai, GEMINI_EMBEDDING_MODEL } from "../config/gemini.js";
import { chunkText } from "../utils/chunker.js";

export const generateEmbedding = async (text) => {
  const result = await ai.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: [text],
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
};

export const indexDocument = async (documentId) => {
  const doc = await db.select().from(documents).where(eq(documents.id, documentId));

  if (doc.length === 0) {
    throw new Error("Document not found");
  }

  const document = doc[0];

  if (!document.extractedText) {
    throw new Error("Document has no extracted text");
  }

  await db.delete(embeddings).where(eq(embeddings.documentId, documentId));

  const chunks = chunkText(document.extractedText);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);

    await db.insert(embeddings).values({
      documentId,
      chunkText: chunks[i],
      chunkIndex: i,
      embedding,
    });
  }

  await db
    .update(documents)
    .set({ isIndexed: true, updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  return { chunksIndexed: chunks.length };
};

export const retrieveRelevantChunks = async (documentId, question, topK = 4) => {
  const questionEmbedding = await generateEmbedding(question);
  const vectorLiteral = `[${questionEmbedding.join(",")}]`;

  const result = await db.execute(sql`
    select chunk_text as "chunkText", chunk_index as "chunkIndex"
    from embeddings
    where document_id = ${documentId}
    order by embedding <=> ${vectorLiteral}::vector
    limit ${topK}
  `);

  return result.rows;
};
