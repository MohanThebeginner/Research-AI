import { eq, and, count, sum, avg, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { documents, conversations, messages } from "../db/schema.js";

export const getDashboardStats = async (request, reply) => {
  const userId = request.user.id;

  const [documentStats] = await db
    .select({
      totalDocuments: count(documents.id),
      storageUsed: sum(documents.size),
    })
    .from(documents)
    .where(eq(documents.ownerId, userId));

  const [aiStats] = await db
    .select({
      totalAiRequests: count(messages.id),
      avgResponseTime: avg(messages.latency),
      totalTokens: sum(messages.tokens),
    })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(and(eq(conversations.userId, userId), eq(messages.sender, "ASSISTANT")));

  const recentDocuments = await db
    .select({
      id: documents.id,
      originalName: documents.originalName,
      uploadStatus: documents.uploadStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, userId))
    .orderBy(desc(documents.createdAt))
    .limit(5);

  return reply.status(200).send({
    totalDocuments: Number(documentStats.totalDocuments) || 0,
    storageUsedBytes: Number(documentStats.storageUsed) || 0,
    totalAiRequests: Number(aiStats.totalAiRequests) || 0,
    avgResponseTimeMs: aiStats.avgResponseTime
      ? Math.round(Number(aiStats.avgResponseTime))
      : 0,
    totalTokensUsed: Number(aiStats.totalTokens) || 0,
    recentDocuments,
  });
};
