import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

export const uploadDocument = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const publicId = `researchai/${Date.now()}-${filename}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteDocumentFile = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
};
