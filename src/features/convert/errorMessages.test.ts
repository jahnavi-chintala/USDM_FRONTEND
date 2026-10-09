import { ApiError } from '@/shared/api/ApiError';

import { describeJobFailure, describeSubmitError } from './errorMessages';

describe('describeSubmitError', () => {
  it.each([
    [401, 'API key required'],
    [413, 'The file is too large'],
    [503, 'The conversion service is not ready'],
    [0, 'Cannot reach the conversion service'],
  ])('explains HTTP %i', (status, title) => {
    expect(describeSubmitError(new ApiError(status, 'msg')).title).toBe(title);
  });

  it('shows the server message for a refused file', () => {
    expect(describeSubmitError(new ApiError(400, 'The upload is not a PDF file.'))).toEqual({
      title: 'This file cannot be converted',
      message: 'The upload is not a PDF file.',
    });
  });
});

describe('describeJobFailure', () => {
  it('explains document reasons', () => {
    expect(describeJobFailure({ detail: 'x', reason: 'scanned_pdf_no_ocr' }, 422).title).toBe(
      'The PDF is a scan',
    );
  });

  it('explains a timeout', () => {
    expect(describeJobFailure({ detail: 'Conversion exceeded 900 s.' }, 504)).toEqual({
      title: 'The conversion took too long',
      message: 'Conversion exceeded 900 s.',
    });
  });

  it('falls back to the server detail', () => {
    expect(describeJobFailure({ detail: 'Internal error: KeyError' }, 500).message).toBe(
      'Internal error: KeyError',
    );
  });
});
