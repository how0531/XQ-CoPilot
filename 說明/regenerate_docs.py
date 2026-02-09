import urllib.request
import re
import ssl
import sys
import time
import os
from urllib.parse import urljoin

# Add current directory to sys.path to import local module
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    import lib_html2md
except ImportError:
    # Fallback if running from root and '說明' is not in path
    sys.path.append(os.path.join(os.getcwd(), "說明"))
    import lib_html2md


def regenerate_full_docs_v2(target_file):
    print("Starting Deep Crawl (Broad Filter & Pagination)...")

    base_url = "https://www.xq.com.tw/lesson/xspractice/"
    visited = set()
    to_visit = [base_url]
    article_links = []

    # Context for likely self-signed certs or legacy SSL
    context = ssl._create_unverified_context()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # 1. Broad Crawl to find ALL article links
    # We will crawl until no new unique article links are found
    page_num = 1

    while to_visit:
        url = to_visit.pop(0)
        if url in visited:
            continue
        visited.add(url)

        print(f"Scanning: {url}")

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                html = response.read().decode("utf-8", errors="ignore")

                # Extract all links
                # Look for <a href="...">
                links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\']', html)

                new_articles = 0
                for link in links:
                    full_link = urljoin(url, link)

                    # Filtering logic:
                    # Must be in /lesson/
                    # Must NOT be /page/ (pagination)
                    # Must NOT be tag/author/category archives if possible (unless they contain unique articles)
                    # We want specific articles.

                    if "/lesson/" in full_link:
                        if any(
                            x in full_link
                            for x in [
                                "/page/",
                                "/tag/",
                                "/author/",
                                "#",
                                "jpg",
                                "png",
                                "facebook",
                                "twitter",
                            ]
                        ):
                            continue

                        # If it looks like an article (has a slug after lesson/category/)
                        # e.g. /lesson/xspractice/foo-bar/
                        # or /lesson/indicator/foo-bar/

                        if full_link not in visited and full_link not in article_links:
                            # Heuristic: Articles usually have a deeper path than categories
                            # But /lesson/xspractice/ IS a category.
                            # We can verify if it's an article by checking the HTML title later?
                            # Or just collect everything and filter duplicates.

                            # Let's collect ALL /lesson/ links that are NOT just the category root valid in sidebar
                            # Most generic logic: Collect everything.
                            if full_link not in article_links:
                                article_links.append(full_link)
                                new_articles += 1

                print(
                    f"  Found {new_articles} new potential articles. Total: {len(article_links)}"
                )

                # Pagination discovery (blindly add next page if we are on a page)
                # If we are on page 1, try page 2
                if "page" not in url and new_articles > 0:
                    # Try to find pagination links in HTML
                    # or just blindly guess
                    # Actually, the sidebar has ALL links usually?
                    # Step 1 found 32. Step 2 found 188.
                    # The sidebar likely contains links to direct articles in other categories.
                    pass

        except Exception as e:
            print(f"  Error scanning {url}: {e}")

    # Remove duplicates and sort
    article_links = sorted(list(set(article_links)))

    # Filter out known non-article pages (categories)
    # e.g. https://www.xq.com.tw/lesson/xspractice/
    # https://www.xq.com.tw/lesson/indicator/
    filtered_links = [
        l for l in article_links if l.count("/") > 4
    ]  # heuristic: https://host/lesson/cat/slug is 5 slashes?
    # https://www.xq.com.tw/lesson/xspractice/ is 5 slashes (trailing).
    # https://www.xq.com.tw/lesson/xspractice/article-slug/ is 6 slashes.

    # Let's count dashes? No.
    # Let's keep checking content.

    print(f"Total Unique Articles to Scrape: {len(filtered_links)}")

    # 2. Extract Content using lib_html2md
    full_content = "# XQ 語法教科書 (完整版)\n\n"

    for i, link in enumerate(filtered_links):
        print(f"[{i+1}/{len(filtered_links)}] Fetching {link}...")
        try:
            req = urllib.request.Request(link, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                html = response.read().decode("utf-8", errors="ignore")

                # Use library to convert
                md = lib_html2md.convert_html(html)

                # Post-process cleaning
                # Remove "複製連結"
                if "複製連結" in md:
                    md = md.split("複製連結")[-1]

                # Remove "前一篇" / "下一篇"
                if "前一篇" in md:
                    md = md.split("前一篇")[0]
                elif "下一篇" in md:
                    md = md.split("下一篇")[0]

                # Clean up repeated newlines
                md = re.sub(r"\n{3,}", "\n\n", md).strip()

                # Get Title from HTML (regex)
                title_match = re.search(r"<title>(.*?)</title>", html)
                title = (
                    title_match.group(1).split("|")[0].strip()
                    if title_match
                    else "Unknown Title"
                )
                title = title.replace(" - XQ 全球贏家", "")

                full_content += f"\n\n---\n\n# {title}\n\n"
                full_content += f"Source: {link}\n\n"
                full_content += md + "\n"

                time.sleep(0.5)  # Be nice

        except Exception as e:
            print(f"  Failed to fetch: {e}")

    # 3. Write to file
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(full_content)

    print("Regeneration complete!")


if __name__ == "__main__":
    regenerate_full_docs_v2("1_XS_語法教科書.md")
