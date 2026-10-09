import { messageFromBody } from './ApiError';

describe('messageFromBody', () => {
  it('reads a string detail', () => {
    expect(messageFromBody({ detail: 'Bad file' }, 'fallback')).toBe('Bad file');
  });

  it('joins FastAPI validation errors', () => {
    expect(
      messageFromBody({ detail: [{ msg: 'field required' }, { msg: 'too long' }] }, 'fallback'),
    ).toBe('field required; too long');
  });

  it('falls back when there is no usable detail', () => {
    expect(messageFromBody({}, 'fallback')).toBe('fallback');
  });
});
