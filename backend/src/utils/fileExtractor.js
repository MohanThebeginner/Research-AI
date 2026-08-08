import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractText = async (filePath, fileType) => {
  if (fileType === "text/plain") {
    return fs.readFile(filePath, "utf-8");
  }

  if (fileType === "application/pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
};
