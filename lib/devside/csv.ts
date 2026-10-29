/**
 * CSV, in one place so it can be tested.
 *
 * This was a private function inside the export route, which meant the one piece of
 * security-relevant string handling in the console — the formula guard — had no test
 * and no second reader. A cell beginning `=`, `+`, `-` or `@` is a formula to Excel
 * and to Sheets, and a lead's free-text field is written by a stranger: without the
 * prefix, `=HYPERLINK(...)` in a description becomes a live formula in the owner's
 * spreadsheet.
 */

/**
 * Bytes Excel looks at before it decides how to read the file. Without it a plain
 * UTF-8 CSV opens in the system codepage and a business name with an ñ or a ₱
 * arrives as mojibake.
 */
export const CSV_BOM = "\ufeff";

/** One cell: guarded against formula injection, quoted, and doubled where it must be. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  /* A leading tab or carriage return is enough to reach the formula parser in some
     versions, so those start the guard as well as the four characters themselves. */
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** A whole document: BOM, CRLF line endings, trailing newline. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return `${CSV_BOM}${lines.join("\r\n")}\r\n`;
}
