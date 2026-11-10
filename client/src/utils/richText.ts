import DOMPurify from "dompurify";

const HTML_TAG = /<\/?[a-z][\s\S]*>/i;

// Descriptions saved before the rich text editor are plain text
export const isHtml = (value: string) => HTML_TAG.test(value);

export const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ALLOWED_ATTR: [],
  });

// Plain-text version for cards and previews
export const htmlToText = (value: string) => {
  if (!value) return "";
  if (!isHtml(value)) return value;
  const doc = new DOMParser().parseFromString(
    value.replace(/<\/(p|li|h2|h3|blockquote)>/gi, " </$1>"),
    "text/html"
  );
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};
