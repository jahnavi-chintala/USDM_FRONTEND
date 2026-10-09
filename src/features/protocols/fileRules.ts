import type { FileType } from './types';

/** Largest file the backend accepts (it answers 413 above this). */
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;

const TYPES: Record<FileType, { extension: string; mime: string }> = {
  pdf: { extension: '.pdf', mime: 'application/pdf' },
  docx: {
    extension: '.docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
};

/** The `accept` attribute of the file picker. */
export const ACCEPTED_FILES = Object.values(TYPES)
  .flatMap(({ extension, mime }) => [mime, extension])
  .join(',');

export function fileTypeOf(file: File): FileType | null {
  const name = file.name.toLowerCase();
  const match = (Object.keys(TYPES) as FileType[]).find(
    (type) => file.type === TYPES[type].mime || name.endsWith(TYPES[type].extension),
  );
  return match ?? null;
}

/** Why a file cannot be uploaded, checked before anything is sent; null when it can. */
export function rejectFile(file: File): string | null {
  if (!fileTypeOf(file)) return `${file.name} is not a PDF or Word (.docx) file.`;
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return `${file.name} is ${mb} MB. The limit is 60 MB per file.`;
  }
  return null;
}
