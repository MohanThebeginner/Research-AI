import {
  uploadDocument as uploadToCloudinary,
  deleteDocumentFile,
} from "../services/storageService.js";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { documents } from "../db/schema.js";
import { extractText } from "../utils/fileExtractor.js";
import { renameDocumentSchema } from "../utils/validators.js";

const ALLOWED_MIME_TYPES = ["text/plain", "application/pdf"];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_LENGTH = 30_000;

export const uploadDocument = async (request, reply) => {
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({
      message: "No file uploaded",
    });
  }

  if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
    return reply.status(400).send({
      message: "Unsupported file type. Only PDF and TXT files are allowed.",
    });
  }

  const buffer = await data.toBuffer();

  if (buffer.length > MAX_FILE_SIZE) {
    return reply.status(400).send({
      message: "File too large. Maximum file size is 10MB.",
    });
  }

  let extractedText;

  try {
    extractedText = await extractText(buffer, data.mimetype);
  } catch (error) {
    request.log.error(error);

    return reply.status(400).send({
      message: "Failed to extract text from document.",
    });
  }

  extractedText = extractedText.trim();

  if (!extractedText) {
    return reply.status(400).send({
      message: "The document does not contain readable text.",
    });
  }

  if (extractedText.length > MAX_EXTRACTED_TEXT_LENGTH) {
    return reply.status(400).send({
      message:
        "Document is too large to process. Please upload a document with no more than 30,000 characters of extracted text.",
    });
  }

  let storage;

  try {
    storage = await uploadToCloudinary(buffer, data.filename);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      message: "Failed to store document.",
    });
  }

  try {
    const newDocument = await db
      .insert(documents)
      .values({
        ownerId: request.user.id,
        filename: data.filename,
        originalName: data.filename,
        fileType: data.mimetype,
        size: buffer.length,
        storageUrl: storage.url,
        cloudinaryPublicId: storage.publicId,
        extractedText,
        uploadStatus: "READY",
      })
      .returning({
        id: documents.id,
        originalName: documents.originalName,
        fileType: documents.fileType,
        size: documents.size,
        uploadStatus: documents.uploadStatus,
        createdAt: documents.createdAt,
      });

    return reply.status(201).send({
      document: newDocument[0],
    });
  } catch (error) {
    // Prevent orphaned Cloudinary files if DB insertion fails.
    await deleteDocumentFile(storage.publicId).catch((cleanupError) => {
      request.log.error(cleanupError);
    });

    throw error;
  }
};

export const getDocuments = async (request, reply) => {
  const userDocuments = await db
    .select({
      id: documents.id,
      originalName: documents.originalName,
      fileType: documents.fileType,
      size: documents.size,
      uploadStatus: documents.uploadStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, request.user.id))
    .orderBy(desc(documents.createdAt));

  return reply.status(200).send({ documents: userDocuments });
};

export const getDocumentById = async (request, reply) => {
  const { id } = request.params;

  const document = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, request.user.id)));

  if (document.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  return reply.status(200).send({ document: document[0] });
};

export const updateDocument = async (request, reply) => {
  const { id } = request.params;

  const parsed = renameDocumentSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const existing = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, request.user.id)));

  if (existing.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  const updated = await db
    .update(documents)
    .set({ originalName: parsed.data.originalName, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning({ id: documents.id, originalName: documents.originalName });

  return reply.status(200).send({ document: updated[0] });
};

export const deleteDocument = async (request, reply) => {
  const { id } = request.params;

  const existing = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, request.user.id)));

  if (existing.length === 0) {
    return reply.status(404).send({ message: "Document not found" });
  }

  await deleteDocumentFile(existing[0].cloudinaryPublicId);

  await db.delete(documents).where(eq(documents.id, id));

  return reply.status(200).send({ message: "Document deleted" });
};
