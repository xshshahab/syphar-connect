import html

import nh3

# Rich text produced by the job description editor. Everything else
# (scripts, styles, event handlers, links, images...) is stripped.
RICH_TEXT_TAGS = {
    "p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "blockquote",
}


def sanitize_rich_text(value: object) -> str:
    return nh3.clean(str(value if value is not None else ""), tags=RICH_TEXT_TAGS, attributes={}).strip()


def strip_tags(value: object) -> str:
    """Plain-text version, used to check that a description is not empty."""
    text = nh3.clean(str(value if value is not None else ""), tags=set(), attributes={})
    return html.unescape(text).replace(" ", " ").strip()
