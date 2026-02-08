import urllib.request
import re
import ssl


def fetch_and_append_articles(target_file):
    print("Fetching missing articles...")

    # 1. Read existing content to find what we have
    with open(target_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 2. Fetch index page
    index_url = "https://www.xq.com.tw/lesson/xspractice/"
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(index_url, context=context) as response:
            html = response.read().decode("utf-8")
    except Exception as e:
        print(f"Failed to fetch index: {e}")
        return

    # 3. Extract article links (simple regex)
    # Look for <a href="https://www.xq.com.tw/lesson/xspractice/..."
    links = re.findall(
        r'<a href="(https://www.xq.com.tw/lesson/xspractice/[^"]+/)"', html
    )
    unique_links = sorted(list(set(links)))

    print(f"Found {len(unique_links)} articles in total.")

    new_articles = []

    for link in unique_links:
        # Check if already in content (by checking the link itself)
        # normalize link for search (remove trailing slash)
        search_link = link.rstrip("/")
        if search_link in content:
            continue

        print(f"Fetching new article: {link}")
        try:
            with urllib.request.urlopen(link, context=context) as response:
                article_html = response.read().decode("utf-8")

            # Extract Title
            title_match = re.search(r'<h1 class="entry-title">(.*?)</h1>', article_html)
            title = title_match.group(1) if title_match else "Unknown Title"

            # Extract Content (entry-content)
            content_match = re.search(
                r'<div class="entry-content">(.*?)</div><!-- .entry-content -->',
                article_html,
                re.DOTALL,
            )
            if content_match:
                article_body = content_match.group(1)

                # Convert HTML to Markdown (Basic)
                # 1. Headers
                article_body = re.sub(
                    r"<h2[^>]*>(.*?)</h2>", r"\n## \1\n", article_body
                )
                article_body = re.sub(
                    r"<h3[^>]*>(.*?)</h3>", r"\n### \1\n", article_body
                )
                # 2. Paragraphs
                article_body = re.sub(r"<p[^>]*>", r"\n", article_body)
                article_body = re.sub(r"</p>", r"\n", article_body)
                # 3. Code blocks (pre)
                article_body = re.sub(
                    r"<pre[^>]*>(.*?)</pre>",
                    lambda m: "\n```xs\n"
                    + m.group(1).replace("<br />", "\n").replace("&nbsp;", " ")
                    + "\n```\n",
                    article_body,
                    flags=re.DOTALL,
                )
                # 4. Images
                article_body = re.sub(
                    r'<img [^>]*src="([^"]+)"[^>]*>', r"\n![](\1)\n", article_body
                )
                # 5. Clean tags
                article_body = re.sub(r"<[^>]+>", "", article_body)
                # 6. Entities
                article_body = (
                    article_body.replace("&lt;", "<")
                    .replace("&gt;", ">")
                    .replace("&amp;", "&")
                    .replace("&nbsp;", " ")
                )

                # Append formatted section
                section = f'\n\n<a name="{title}"></a>\n\n# [{title}]({link})\n\n{article_body}\n'
                new_articles.append(section)

        except Exception as e:
            print(f"Error fetching {link}: {e}")

    if new_articles:
        print(f"Appending {len(new_articles)} new articles...")
        with open(target_file, "a", encoding="utf-8") as f:
            f.write("".join(new_articles))
        print("Done.")
    else:
        print("No new articles to append.")


if __name__ == "__main__":
    fetch_and_append_articles("說明/1_XS_語法教科書.md")
