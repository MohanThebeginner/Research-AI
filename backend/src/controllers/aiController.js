import { eq, and, asc } from "drizzle-orm";
import { db } from "../config/db.js";
import { documents, conversations, messages } from "../db/schema.js";
import { ai, GEMINI_MODEL } from "../config/gemini.js";
import { retrieveRelevantChunks } from "../services/embeddingService.js";
import { chatSchema } from "../utils/validators.js";

const MAX_CONTEXT_CHARS = 12000;

export const summarizeDocument = async (request, reply) => {
  const { documentId } = request.params;

  const doc = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, request.user.id)));

  if (doc.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  const document = doc[0];

  if (!document.extractedText) {
    return reply.status(400).send({ message: "Document has no extracted text" });
  }

  const prompt = `Summarize this document into:
1. Executive summary
2. Key points
3. Important facts
4. Final takeaway

Keep it between 150-300 words with bullet highlights.

Document:
${document.extractedText.slice(0, MAX_CONTEXT_CHARS)}`;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const summary = result.text;

    await db
      .update(documents)
      .set({ summary, updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    return reply.status(200).send({ summary });
  } catch (err) {
    request.log.error(err);

    if (err.status === 429) {
      return reply
        .status(429)
        .send({ message: "AI service is rate limited right now, please try again shortly" });
    }

    return reply.status(500).send({ message: "Failed to generate summary" });
  }
};

export const chatWithDocument = async (request, reply) => {
  const { documentId } = request.params;

  const parsed = chatSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { message } = parsed.data;

  const doc = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, request.user.id)));

  if (doc.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  const document = doc[0];

  const existingConversation = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.documentId, documentId), eq(conversations.userId, request.user.id))
    );

  let conversationId;

  if (existingConversation.length === 0) {
    const newConversation = await db
      .insert(conversations)
      .values({ documentId, userId: request.user.id })
      .returning({ id: conversations.id });
    conversationId = newConversation[0].id;
  } else {
    conversationId = existingConversation[0].id;
  }

  const pastMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const historyText = pastMessages.map((m) => `${m.sender}: ${m.content}`).join("\n");

  let contextText;
  let usedRag = false;

  if (document.isIndexed) {
    const relevantChunks = await retrieveRelevantChunks(documentId, message);
    contextText = relevantChunks.map((c) => c.chunkText).join("\n\n---\n\n");
    usedRag = true;
  } else {
    contextText = document.extractedText.slice(0, MAX_CONTEXT_CHARS);
  }

  const prompt = `You are answering questions about the following document excerpts. Use only information from these excerpts to answer. If the answer is not present, say so clearly.

Document excerpts:
${contextText}

Conversation so far:
${historyText}

User question: ${message}`;

  const startTime = Date.now();

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const answer = result.text;
    const latency = Date.now() - startTime;

    await db.insert(messages).values({
      conversationId,
      sender: "USER",
      content: message,
    });

    await db.insert(messages).values({
      conversationId,
      sender: "ASSISTANT",
      content: answer,
      latency,
    });

    return reply.status(200).send({ answer, usedRag });
  } catch (err) {
    request.log.error(err);

    if (err.status === 429) {
      return reply
        .status(429)
        .send({ message: "AI service is rate limited right now, please try again shortly" });
    }

    return reply.status(500).send({ message: "Failed to generate response" });
  }
};

export const getChatHistory = async (request, reply) => {
  const { documentId } = request.params;

  const existingConversation = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.documentId, documentId), eq(conversations.userId, request.user.id))
    );

  if (existingConversation.length === 0) {
    return reply.status(200).send({ messages: [] });
  }

  const conversationMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, existingConversation[0].id))
    .orderBy(asc(messages.createdAt));

  return reply.status(200).send({ messages: conversationMessages });
};
