import { fileTypeOf, MAX_UPLOAD_BYTES, rejectFile } from './fileRules';

function fileOf(name: string, size = 10, type = ''): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('fileTypeOf', () => {
  it('recognises PDF and Word files by type or extension', () => {
    expect(fileTypeOf(fileOf('a.PDF'))).toBe('pdf');
    expect(fileTypeOf(fileOf('a', 10, 'application/pdf'))).toBe('pdf');
    expect(fileTypeOf(fileOf('protocol.docx'))).toBe('docx');
    expect(fileTypeOf(fileOf('notes.txt', 10, 'text/plain'))).toBeNull();
  });
});

describe('rejectFile', () => {
  it('accepts a PDF under the limit', () => {
    expect(rejectFile(fileOf('a.pdf', MAX_UPLOAD_BYTES))).toBeNull();
  });

  it('refuses other types, empty files and files over 60 MB', () => {
    expect(rejectFile(fileOf('a.doc'))).toMatch(/not a PDF or Word/);
    expect(rejectFile(fileOf('a.pdf', 0))).toMatch(/is empty/);
    expect(rejectFile(fileOf('big.pdf', 74 * 1024 * 1024))).toBe(
      'big.pdf is 74 MB. The limit is 60 MB per file.',
    );
  });
});
