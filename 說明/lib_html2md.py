from html.parser import HTMLParser
import re


class HTMLToMarkdown(HTMLParser):
    def __init__(self, use_main_only=True):
        super().__init__()
        self.markdown = []
        self.in_main = False
        self.in_pre = False
        self.in_code = False
        self.ignore_content = False
        self.ignore_tags = [
            "script",
            "style",
            "noscript",
            "iframe",
            "svg",
            "nav",
            "footer",
            "header",
        ]
        self.list_depth = 0
        self.current_tag = None
        self.href = None
        self.use_main_only = use_main_only

        # If not strict main checking, we capture by default (except ignored tags)
        self.capture_content = not use_main_only

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag = tag

        if self.use_main_only:
            if (
                tag == "main"
                or attrs_dict.get("id") == "main-content"
                or attrs_dict.get("role") == "main"
            ):
                self.capture_content = True
                self.in_main = True

        if tag in self.ignore_tags:
            self.ignore_content = True
            return

        if not self.capture_content and self.use_main_only:
            return

        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            level = int(tag[1])
            self.markdown.append("\n\n" + "#" * level + " ")
        elif tag == "p":
            self.markdown.append("\n\n")
        elif tag == "br":
            self.markdown.append("  \n")
        elif tag == "pre":
            self.in_pre = True
            self.markdown.append("\n\n```\n")
        elif tag == "code":
            self.in_code = True
            if not self.in_pre:
                self.markdown.append("`")
        elif tag == "ul":
            self.list_depth += 1
            self.markdown.append("\n")
        elif tag == "ol":
            self.list_depth += 1
            self.markdown.append("\n")
        elif tag == "li":
            indent = "  " * (self.list_depth - 1)
            self.markdown.append("\n" + indent + "- ")
        elif tag == "a":
            self.href = attrs_dict.get("href")
            self.markdown.append("[")
        elif tag == "strong" or tag == "b":
            self.markdown.append("**")
        elif tag == "em" or tag == "i":
            self.markdown.append("*")
        elif tag == "img":
            src = attrs_dict.get("src")
            alt = attrs_dict.get("alt", "")
            self.markdown.append(f"\n![{alt}]({src})\n")
        elif tag == "blockquote":
            self.markdown.append("\n> ")
        elif tag == "hr":
            self.markdown.append("\n---\n")

    def handle_endtag(self, tag):
        if tag in self.ignore_tags:
            self.ignore_content = False
            return

        if not self.capture_content and self.use_main_only:
            return

        if tag == "main" and self.use_main_only:
            self.capture_content = False
            self.in_main = False

        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.markdown.append("\n")
        elif tag == "p":
            self.markdown.append("\n")
        elif tag == "pre":
            self.in_pre = False
            self.markdown.append("\n```\n\n")
        elif tag == "code":
            self.in_code = False
            if not self.in_pre:
                self.markdown.append("`")
        elif tag == "ul":
            self.list_depth -= 1
            self.markdown.append("\n")
        elif tag == "ol":
            self.list_depth -= 1
            self.markdown.append("\n")
        elif tag == "li":
            self.markdown.append("")
        elif tag == "a":
            href = self.href if self.href else "#"
            self.markdown.append(f"]({href})")
            self.href = None
        elif tag == "strong" or tag == "b":
            self.markdown.append("**")
        elif tag == "em" or tag == "i":
            self.markdown.append("*")

    def handle_data(self, data):
        if self.ignore_content:
            return

        if not self.capture_content and self.use_main_only:
            return

        text = data
        if self.in_pre:
            self.markdown.append(text)
        else:
            temp = " ".join(text.split())
            if not temp:
                return
            temp = temp.replace("*", "\\*").replace("_", "\\_")
            self.markdown.append(temp + " ")

    def get_markdown(self):
        return "".join(self.markdown)


def convert_html(html_content):
    # Try rigorous main content extraction first
    parser = HTMLToMarkdown(use_main_only=True)
    parser.feed(html_content)
    md = parser.get_markdown()

    # Heuristic check for success (e.g. > 100 chars?)
    if len(md) < 50:
        # Fallback to lax parsing (whole body but skip nav/footer)
        parser = HTMLToMarkdown(use_main_only=False)
        parser.feed(html_content)
        md = parser.get_markdown()

    return md
