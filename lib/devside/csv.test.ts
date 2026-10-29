import { describe, expect, it } from "vitest";
import { CSV_BOM, csvCell, toCsv } from "@/lib/devside/csv";

describe("csvCell", () => {
  it("quotes every cell, so a comma or a newline cannot split one", () => {
    expect(csvCell("Cruz, Maria")).toBe('"Cruz, Maria"');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
  });

  it("doubles an embedded quote rather than ending the cell", () => {
    expect(csvCell('She said "no"')).toBe('"She said ""no"""');
  });

  it("prefixes the four characters Excel treats as a formula", () => {
    for (const value of ["=1+1", "+63 917 000 0000", "-5", "@SUM(A1)"]) {
      expect(csvCell(value)).toBe(`"'${value}"`);
    }
  });

  it("prefixes a leading tab or carriage return, which reach the parser too", () => {
    expect(csvCell("\t=1+1")).toBe('"\'\t=1+1"');
    expect(csvCell("\r=1+1")).toBe('"\'\r=1+1"');
  });

  it("leaves an ordinary value alone apart from its quotes", () => {
    expect(csvCell("Optimal Core OS")).toBe('"Optimal Core OS"');
    expect(csvCell("2.51")).toBe('"2.51"');
  });

  it("renders nothing as an empty cell, not the word null", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell("")).toBe('""');
  });

  it("stringifies a number or a boolean rather than dropping it", () => {
    expect(csvCell(12)).toBe('"12"');
    expect(csvCell(false)).toBe('"false"');
  });
});

describe("toCsv", () => {
  it("starts with a BOM, because Excel reads a bare UTF-8 file as mojibake", () => {
    expect(toCsv(["a"], []).startsWith(CSV_BOM)).toBe(true);
    expect(CSV_BOM).toBe("\ufeff");
  });

  it("joins with CRLF and ends with one", () => {
    expect(toCsv(["Name", "Email"], [["Maria", "maria@example.ph"]])).toBe(
      `${CSV_BOM}"Name","Email"\r\n"Maria","maria@example.ph"\r\n`,
    );
  });

  it("keeps the header row even when there are no rows", () => {
    expect(toCsv(["Name"], [])).toBe(`${CSV_BOM}"Name"\r\n`);
  });

  it("guards a row that came out of the database, not only a header", () => {
    expect(toCsv(["Phone"], [["=cmd|' /C calc'!A0"]])).toContain(`"'=cmd`);
  });

  it("writes a short row as short, so the caller owns the column count", () => {
    /* Not padding: a selector that forgot a column should look wrong in the file
       rather than silently land its last value under the wrong header. */
    expect(toCsv(["a", "b"], [["1"]])).toBe(`${CSV_BOM}"a","b"\r\n"1"\r\n`);
  });
});
