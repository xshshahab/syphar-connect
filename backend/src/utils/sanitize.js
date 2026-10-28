import sanitizeHtml from "sanitize-html";

// Rich text produced by the job description editor. Everything else
// (scripts, styles, event handlers, links, images...) is stripped.
const RICH_TEXT_OPTIONS = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
  ],
  allowedAttributes: {},
};

export const sanitizeRichText = (html) =>
  sanitizeHtml(String(html ?? ""), RICH_TEXT_OPTIONS).trim();

// Plain-text version, used to check that a description is not empty
export const stripTags = (html) =>
  sanitizeHtml(String(html ?? ""), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .trim();
