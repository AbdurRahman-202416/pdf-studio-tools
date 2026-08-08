import type { ToolContent } from "@/lib/tools/types";

export const content: ToolContent = {
  slug: "gpa-calculator",
  primaryKeyword: "gpa calculator",
  metaDescription: "Free GPA calculator on the 4.0 scale. Add your courses with credits and grades for a credit-weighted average.",
  relatedKeywords: [
    "grade point average calculator",
    "college gpa",
    "weighted gpa",
    "semester gpa calculator",
  ],
  faqs: [
    { q: "Which scale does this use?", a: "The US 4.0 scale with plus/minus grades - A is 4.0, A- is 3.7, B+ is 3.3 and so on. Institutions differ, so check your registrar's table." },
    { q: "What does credit-weighted mean?", a: "Courses count in proportion to their credit hours. A four-credit course moves your GPA twice as much as a two-credit one, which is why credits matter as much as grades." },
    { q: "Does this handle weighted or honours GPA?", a: "No. Some schools use a 5.0 scale for AP and honours courses. Enter those with their weighted value if your institution uses one." },
    { q: "What about UK or European grades?", a: "Those systems do not use GPA at all - the UK uses classifications and much of Europe uses ECTS grades. Conversion to GPA is approximate at best and institution-specific." },
  ],
  howTo: [
    { name: "Add your courses", text: "Name is optional; grade and credits are what count." },
    { name: "Set grades and credit hours", text: "Add or remove rows as needed." },
    { name: "Read your GPA", text: "Credit-weighted, with total credits and grade points shown." },
  ],
  seoCopy:
    "Calculate a credit-weighted grade point average on the US 4.0 scale with plus/minus grades, adding as many courses as you need. Weighting by credit hours is the part people most often get wrong by hand: a four-credit course moves your average twice as much as a two-credit one, so grades and credits matter equally. Institutions vary - some ignore plus/minus, some use a 5.0 weighted scale for honours courses, and UK and European systems do not use GPA at all, so any conversion there is approximate.",
};
