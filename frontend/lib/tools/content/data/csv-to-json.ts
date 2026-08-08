import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "csv-to-json",
  primaryKeyword: "csv to json converter online",
  metaDescription: "Free CSV to JSON converter, and JSON back to CSV. Handles quoted fields, embedded commas and CRLF properly.",
  relatedKeywords: [
    "json to csv",
    "convert csv",
    "csv parser online",
    "csv converter",
    "excel to json",
  ],
  faqs: [
    { q: "Does it handle commas inside a field?", a: "Yes. Quoted fields are parsed properly, including doubled quotes as an escape - which is where naive split-on-comma converters fall apart." },
    { q: "What becomes the JSON keys?", a: "The first row. If a header cell is blank it becomes column_1, column_2 and so on, so no field is silently dropped." },
    { q: "Are numbers converted to numbers?", a: "No - every value stays a string. CSV carries no type information, and guessing is how leading zeros disappear from postcodes and long IDs turn into floats." },
    { q: "Can I use semicolons or tabs?", a: "Yes, pick the delimiter. Semicolon-separated files are common from European Excel installations, where the comma is the decimal separator." },
  ],
  howTo: [
    { name: "Pick a direction", text: "CSV to JSON, or JSON back to CSV." },
    { name: "Choose your delimiter", text: "Comma, semicolon or tab." },
    { name: "Copy the result", text: "Row and column counts are shown so you can sanity-check the parse." },
  ],
  seoCopy:
    "Convert CSV to JSON and back, with a parser that handles the things simple split-on-comma converters get wrong: quoted fields containing commas, doubled quotes as an escape, and CRLF line endings. The first row becomes the JSON keys, and a blank header cell becomes column_1 rather than silently dropping the field. Values stay strings deliberately - CSV carries no type information, and guessing is exactly how leading zeros vanish from postcodes and long identifiers get mangled into floats. Semicolon and tab delimiters are supported.",
};
