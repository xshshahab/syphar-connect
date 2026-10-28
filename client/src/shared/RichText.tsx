import React from "react";
import { isHtml, sanitizeHtml } from "@/utils/richText";
import { cn } from "@/lib/utils";

interface RichTextProps {
  html: string;
  className?: string;
}

// Renders a job description: sanitized HTML, or legacy plain text
const RichText: React.FC<RichTextProps> = ({ html, className }) => {
  if (!isHtml(html)) {
    return <p className={cn("whitespace-pre-line", className)}>{html}</p>;
  }

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

export default RichText;
