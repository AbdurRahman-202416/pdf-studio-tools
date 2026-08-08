import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "sql-formatter",
  primaryKeyword: "sql formatter online",
  metaDescription: "Free SQL formatter and beautifier for PostgreSQL, MySQL, SQLite, BigQuery and standard SQL. Runs in your browser.",
  relatedKeywords: [
    "sql beautifier",
    "format sql query",
    "sql pretty print",
    "postgres formatter",
    "mysql formatter",
  ],
  faqs: [
    { q: "Does it change what my query does?", a: "No. Formatting only changes whitespace, line breaks and keyword casing. The query is semantically identical." },
    { q: "Why does dialect matter?", a: "Because each has syntax the others don't - BigQuery's backtick-quoted names, PostgreSQL's :: casts, MySQL's specific functions. Choosing the right dialect keeps the formatter from mangling them." },
    { q: "Is my query sent to a server?", a: "No. Formatting runs in your browser, so it is safe to paste a query containing real table names, schema details or embedded values." },
    { q: "Why did it fail on my query?", a: "Usually a template placeholder - things like {{var}} or :param from an ORM aren't valid SQL, so the parser stops. Replace them with literals to format, then put them back." },
  ],
  howTo: [
    { name: "Paste your SQL", text: "One statement or several." },
    { name: "Pick your dialect", text: "Standard, PostgreSQL, MySQL, SQLite or BigQuery." },
    { name: "Copy the formatted query", text: "Keywords uppercased and clauses indented, with the meaning untouched." },
  ],
  seoCopy:
    "Format an unreadable one-line SQL query into something you can actually review, with keywords uppercased and clauses indented. Formatting only touches whitespace and casing, so the query means exactly what it meant before. Choosing the right dialect matters more than it looks: BigQuery's backtick-quoted identifiers, PostgreSQL's double-colon casts and MySQL-specific functions all confuse a parser set to the wrong grammar. Everything runs in your browser, so pasting a query with real schema names is safe.",
};
