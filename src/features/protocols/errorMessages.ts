import { isApiError } from '@/shared/api/ApiError';

import type { FailureReason, ProcessingStage, ProtocolFailure } from './types';

export interface ErrorDescription {
  title: string;
  message: string;
  /** What the user can do about it. */
  action: string;
}

export const STAGE_LABEL: Record<ProcessingStage, string> = {
  extracting_text: 'Extracting Text',
  mapping_to_usdm: 'Mapping to USDM',
  validating: 'Validating',
};

/** Why an upload was refused, for the given HTTP status. */
export function describeUploadError(error: unknown): ErrorDescription {
  if (!isApiError(error)) {
    return {
      title: 'Upload failed',
      message: 'Something went wrong.',
      action: 'Try again.',
    };
  }
  switch (error.status) {
    case 0:
      return {
        title: 'Cannot reach the conversion service',
        message: error.message,
        action: 'Try again later; nothing was uploaded.',
      };
    case 400:
      return {
        title: 'Not a PDF or Word file',
        message: 'Only PDF and Word (.docx) protocols can be converted.',
        action: 'Choose a PDF or Word file.',
      };
    case 401:
      return {
        title: 'Not authorised',
        message: 'The service did not accept the API key.',
        action: 'Check the API key in Settings, or contact your administrator.',
      };
    case 413:
      return {
        title: 'File is over 60 MB',
        message: 'The limit is 60 MB per file.',
        action: 'Remove embedded scans or appendices to make the file smaller, then upload again.',
      };
    case 503:
      return {
        title: 'Conversion service unavailable',
        message: 'The conversion service is not configured right now.',
        action: 'Try again later; nothing was uploaded.',
      };
    default:
      return { title: 'Upload failed', message: error.message, action: 'Try again.' };
  }
}

const REASON_TEXT: Record<FailureReason, ErrorDescription> = {
  scanned_pdf_no_ocr: {
    title: 'Scanned document — no text layer',
    message:
      'This file is an image scan. iDigitise reads text-based PDF and Word files; it does not run OCR in this version.',
    action:
      'Upload a text-based version of the protocol (export it from Word or the source system).',
  },
  encrypted_pdf: {
    title: 'Password-protected file',
    message: 'The PDF is encrypted, so its content cannot be read.',
    action: 'Remove the password and upload the file again.',
  },
  corrupt_pdf: {
    title: 'File could not be read',
    message: 'The file is damaged or has no readable pages.',
    action: 'Export the protocol again and upload the new file.',
  },
  timeout: {
    title: 'Conversion timed out',
    message: 'The conversion took longer than 15 minutes and was stopped.',
    action: 'Retry processing. Very long protocols may need to be split.',
  },
  validation_failed: {
    title: 'Validation failed',
    message: 'Text was extracted, but the mapped study could not be assembled into valid USDM.',
    action: 'Retry processing. If it fails again, upload a cleaner copy.',
  },
};

/** Why processing stopped. */
export function describeFailure(failure: ProtocolFailure): ErrorDescription {
  const known = failure.reason ? REASON_TEXT[failure.reason] : undefined;
  if (known) {
    return failure.detail && failure.reason === 'validation_failed'
      ? { ...known, message: `${known.message} ${failure.detail}` }
      : known;
  }
  return {
    title: 'Processing failed',
    message: failure.detail ?? 'No details were returned.',
    action: 'Retry processing. If it fails again, upload the file again.',
  };
}
