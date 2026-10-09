import { isApiError } from '@/shared/api/ApiError';

import type { JobError } from './types';

export interface ErrorDescription {
  title: string;
  message: string;
}

/** Text for the document-level `reason` codes of the conversion API. */
const REASON_TEXT: Record<string, ErrorDescription> = {
  corrupt_pdf: {
    title: 'The PDF cannot be read',
    message: 'The file is corrupt or has no readable pages. Export the protocol to PDF again.',
  },
  encrypted_pdf: {
    title: 'The PDF is password-protected',
    message: 'Remove the password and upload an unencrypted copy.',
  },
  scanned_pdf_no_ocr: {
    title: 'The PDF is a scan',
    message:
      'The file has no text layer, and scanned documents are not supported (no OCR). Upload a PDF with selectable text.',
  },
};

/** Why an upload was refused, for the given HTTP status. */
export function describeSubmitError(error: unknown): ErrorDescription {
  if (!isApiError(error)) {
    return { title: 'Upload failed', message: 'Something went wrong. Try again.' };
  }
  switch (error.status) {
    case 0:
      return { title: 'Cannot reach the conversion service', message: error.message };
    case 400:
      return { title: 'This file cannot be converted', message: error.message };
    case 401:
      return {
        title: 'API key required',
        message: 'The conversion service needs a valid API key. Set it in Settings (⚙ top right).',
      };
    case 413:
      return { title: 'The file is too large', message: error.message };
    case 503:
      return {
        title: 'The conversion service is not ready',
        message:
          'Its AI pipeline is not configured (no OpenRouter key). Contact the service administrator.',
      };
    default:
      return { title: 'Upload failed', message: error.message };
  }
}

/** Why a job ended in `failed`. */
export function describeJobFailure(
  error: JobError | undefined,
  httpStatus?: number,
): ErrorDescription {
  const known = error?.reason ? REASON_TEXT[error.reason] : undefined;
  if (known) return known;
  const detail = error?.detail ?? 'No details were returned.';
  if (httpStatus === 504) return { title: 'The conversion took too long', message: detail };
  if (httpStatus === 422) {
    return { title: 'The protocol could not be converted to USDM', message: detail };
  }
  return { title: 'The conversion failed', message: detail };
}
