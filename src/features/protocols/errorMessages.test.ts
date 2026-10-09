import { ApiError } from '@/shared/api/ApiError';

import { describeFailure, describeUploadError } from './errorMessages';

describe('describeUploadError', () => {
  it.each([
    [400, 'Not a PDF or Word file'],
    [401, 'Not authorised'],
    [413, 'File is over 60 MB'],
    [503, 'Conversion service unavailable'],
    [0, 'Cannot reach the conversion service'],
  ])('explains HTTP %i', (status, title) => {
    expect(describeUploadError(new ApiError(status, 'x')).title).toBe(title);
  });

  it('falls back to the server message', () => {
    expect(describeUploadError(new ApiError(500, 'Boom')).message).toBe('Boom');
  });
});

describe('describeFailure', () => {
  it('explains each known reason', () => {
    const failure = { stage: 'extracting_text' as const, detail: null, errors: [] };
    expect(describeFailure({ ...failure, reason: 'scanned_pdf_no_ocr' }).title).toMatch(/Scanned/);
    expect(describeFailure({ ...failure, reason: 'encrypted_pdf' }).title).toMatch(/Password/);
    expect(describeFailure({ ...failure, reason: 'timeout' }).title).toMatch(/timed out/);
  });

  it('adds the detail of a validation failure, and handles unknown reasons', () => {
    const failure = { stage: 'validating' as const, errors: [] };
    expect(
      describeFailure({ ...failure, reason: 'validation_failed', detail: '3 blocking errors.' })
        .message,
    ).toMatch(/3 blocking errors\.$/);
    expect(describeFailure({ ...failure, reason: null, detail: 'Disk full' }).message).toBe(
      'Disk full',
    );
  });
});
