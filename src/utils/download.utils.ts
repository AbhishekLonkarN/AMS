export type CsvCell = string | number | null | undefined;

/** Cells that start with these are treated as formulas by spreadsheet apps; a leading apostrophe keeps them text. */
const FORMULA_START = /^[=+\-@\t\r]/;

const toCsvCell = (value: CsvCell) => {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = typeof value === 'string' && FORMULA_START.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

interface SaveFileHandle {
  createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>;
}

type SaveFilePicker = (options: {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}) => Promise<SaveFileHandle>;

const downloadWithLink = (filename: string, content: string, mimeType: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Saves text as a file. Where the browser supports it, a "Save as" window lets the user pick the exact
 * location and this resolves `true` only once the file is written (`false` if they cancel), so callers
 * can show "exported" only when it really was. Other browsers just download to their default folder
 * (they cannot report back), which counts as saved.
 */
export async function saveFile(filename: string, content: string, mimeType: string, description: string): Promise<boolean> {
  const showSaveFilePicker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
  const extension = filename.slice(filename.lastIndexOf('.'));

  if (showSaveFilePicker) {
    try {
      const handle = await showSaveFilePicker({
        suggestedName: filename,
        types: [{ description, accept: { [mimeType.split(';')[0]]: [extension] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false; // the user cancelled
      // Any other failure (blocked picker, no permission): use a normal download instead.
    }
  }

  downloadWithLink(filename, content, mimeType);
  return true;
}

const UTF8_BOM = '\uFEFF';

/**
 * Saves rows as a .csv file that opens in Excel (UTF-8 with a BOM so accents and symbols survive).
 * Resolves `true` once saved, `false` if the user cancelled the "Save as" window.
 */
export function downloadCsv(filename: string, rows: CsvCell[][]): Promise<boolean> {
  const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
  return saveFile(filename, UTF8_BOM + csv, 'text/csv;charset=utf-8', 'CSV file (opens in Excel)');
}
