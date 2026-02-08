import re


def scan_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_code_block = False
    start_line = 0
    suspect_blocks = []

    for i, line in enumerate(lines):
        if line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                start_line = i + 1
            else:
                in_code_block = False
                end_line = i + 1

                # Analyze the block content
                block_content = "".join(lines[start_line : end_line - 1])

                # Check for Chinese characters
                chinese_chars = re.findall(r"[\u4e00-\u9fff]", block_content)

                # Heuristic: if a code block has more than 10 Chinese characters, it's suspicious
                if len(chinese_chars) > 10:
                    suspect_blocks.append((start_line, end_line, len(chinese_chars)))

    return suspect_blocks


filepath = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\內建.md"
suspects = scan_file(filepath)

with open(
    r"c:\Users\How\OneDrive\Documents\XQ chatbot\scripts\scan_report.txt",
    "w",
    encoding="utf-8",
) as report:
    report.write(f"Found {len(suspects)} suspicious code blocks in {filepath}:\n")
    for start, end, count in suspects:
        report.write(f"Lines {start}-{end}: {count} Chinese characters\n")
        # Print a snippet
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.readlines()[start : min(start + 3, end - 1)]
            snippet = "".join(content).strip()
            report.write(f"  Snippet: {snippet}...\n")
