// A company website is typed in by a recruiter, so it is never trusted as is.
// Returns a link that is safe to put in an <a href>, or null when there is none.
//   "acme.com"            -> { href: "https://acme.com/", label: "acme.com" }
//   "https://www.acme.io/" -> { href: "https://www.acme.io/", label: "acme.io" }
//   "javascript:alert(1)" -> null   (only http and https are ever linked)
export const toSafeLink = (
  value: string | null | undefined,
): { href: string; label: string } | null => {
  const text = (value ?? "").trim();
  if (!text) return null;

  // add https:// when the recruiter left the scheme out; any other scheme
  // (javascript:, data:, ftp: ...) is refused below
  const hasScheme =
    /^[a-z][a-z0-9+.-]*:/i.test(text) && !/^[^/]+:\d+/.test(text);
  const candidate = hasScheme ? text : `https://${text.replace(/^\/+/, "")}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null; // "localhost", "abc"
    const label = url.hostname.replace(/^www\./, "");
    return {
      href: url.href,
      label:
        url.pathname.length > 1
          ? label + url.pathname.replace(/\/$/, "")
          : label,
    };
  } catch {
    return null;
  }
};
