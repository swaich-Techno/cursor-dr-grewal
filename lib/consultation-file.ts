export const MAX_CONSULTATION_BYTES = 8 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"]);
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function validateConsultationFile(file: {
  name: string;
  type: string;
  size: number;
}): "type" | "empty" | "size" | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return "type";
  if (file.type && file.type !== "application/octet-stream" && !ALLOWED_TYPES.has(file.type)) return "type";
  if (file.size <= 0) return "empty";
  if (file.size > MAX_CONSULTATION_BYTES) return "size";
  return null;
}
