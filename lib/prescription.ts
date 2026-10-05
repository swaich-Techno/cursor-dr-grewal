export const MAX_PRESCRIPTION_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function validatePrescriptionFile(file: {
  name: string;
  type: string;
  size: number;
}): "type" | "empty" | "size" | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return "type";
  if (file.type && !ALLOWED_TYPES.has(file.type)) return "type";
  if (file.size <= 0) return "empty";
  if (file.size > MAX_PRESCRIPTION_BYTES) return "size";
  return null;
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
