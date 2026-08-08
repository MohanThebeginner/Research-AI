ALTER TABLE "documents" RENAME COLUMN "storage_path" TO "storage_url";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "cloudinary_public_id" text NOT NULL;