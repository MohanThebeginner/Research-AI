import pdfParse from "pdf-parse";

export const extractText = async (buffer, fileType) => {
  if (fileType === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (fileType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  throw new Error("Unsupported file type");
};
