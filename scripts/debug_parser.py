import sys
from pathlib import Path
import re


# Copy paste clean_cell_text from convert_builtin_md.py
def clean_cell_text(text: str) -> str:
    """清理單個儲存格的文字"""
    text = text.strip()
    if not text:
        return ""

    # 移除 Markdown 粗體標記 (如果是整行粗體)
    # text = re.sub(r"^\*\*(.*)\*\*$", r"\1", text)

    # 針對 資料.md 等出現的 "1Value1", "2Value1" 等編號進行去噪
    # 移除開頭的數字，如果後面緊接英文字母 (避免誤刪 "10日均線")
    text = re.sub(r"^\d+(?=[A-Za-z_])", "", text)

    # 移除 "複製1", "複製2" 等 scraper artifact
    text = re.sub(r"^複製\d+", "", text)

    # Replace literal \n with actual newline
    text = text.replace("\\n", "\n")

    return text.strip()


def main():
    filepath = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\關鍵字.md.backup"
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    start_line = 65  # 0-indexed, corresponds to line 66 in view_file
    end_line = 75

    print(f"Reading lines {start_line} to {end_line} from {filepath}")

    with open(
        r"c:\Users\How\OneDrive\Documents\XQ chatbot\scripts\debug_output.txt",
        "w",
        encoding="utf-8",
    ) as out:
        subset = lines[start_line:end_line]
        for i, line in enumerate(subset):
            cleaned = clean_cell_text(line)
            out.write(f"Line {start_line + i}: {repr(line)}\n")
            out.write(f"Cleaned: {repr(cleaned)}\n")


if __name__ == "__main__":
    main()
