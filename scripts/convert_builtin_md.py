"""
重構內建.md及其他說明文檔
將表格格式轉換為易讀的Markdown格式 - 基於XS官方文檔格式
支援自動判斷多種表格結構 (內建、系統、資料、選股、報價)
支援重新解析已轉換的Markdown檔案 (Re-processing)
"""

import re
from pathlib import Path


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


def parse_table_row(line: str) -> dict:
    """
    解析表格行, 嘗試提取最合理的 category, name, description, syntax_ref
    """
    if not line.strip().startswith("|"):
        return None

    parts = [p.strip() for p in line.split("|")]
    if not parts[0]:
        parts.pop(0)
    if parts and not parts[-1]:
        parts.pop()

    if len(parts) < 2:
        return None

    if "---" in line or parts[0] == "Cat" or parts[0] == "web-scraper-order":
        return None

    category_idx = 0
    name_idx = 1

    if len(parts) > 4 and re.match(r"^\d+-\d+$", parts[0]):
        category_idx = 2
        name_idx = 4
    else:
        category_idx = 0
        name_idx = 1

    if len(parts) <= max(category_idx, name_idx):
        if len(parts) >= 2:
            category_idx = 0
            name_idx = 1
        else:
            return None

    category = parts[category_idx].strip()
    raw_name = parts[name_idx].strip()
    name = raw_name.split("(")[0].strip() if "(" in raw_name else raw_name

    # FIX: Ensure name is not empty
    if not name:
        return None

    return {"category": category, "name": name, "title": raw_name}


def parse_markdown_header(line: str) -> dict:
    """
    解析 Markdown 標題行 (### Name)
    用於處理已經不是表格格式的檔案
    """
    if not line.strip().startswith("###"):
        return None

    content = line.strip().replace("###", "").strip()
    if not content:
        return None

    # 假設 content 就是 function name
    name = content.split("(")[0].strip()
    return {"category": None, "name": name, "title": content}


def is_syntax_line(text: str, func_name: str) -> bool:
    """寬鬆判斷是否為程式碼/語法行"""
    # 如果已經是 code block 標記，忽略
    if text.startswith("```"):
        return False

    if func_name in text and "(" in text and ")" in text:
        return True
    if "Value1 =" in text or "value1 =" in text:
        return True
    if "Ret =" in text or "ret =" in text:
        return True
    if "GetField" in text or "GetQuote" in text or "GetSymbol" in text:
        return True
    if text.startswith("If ") and "Then" in text:
        return True
    if ";" in text and ("=" in text or "(" in text):
        chinese_count = sum(1 for c in text if "\u4e00" <= c <= "\u9fff")
        if chinese_count < 5:
            return True
    return False


def format_function_block(func_info: dict, content_lines: list) -> str:
    """格式化單個函數區塊"""
    output = []
    output.append(f"### {func_info['name']}\n")

    # 避免重複標題 (如果 title 跟 name 很像)
    if func_info["title"] and func_info["title"] != func_info["name"]:
        # 檢查 content 是否第一行就是 title
        if content_lines and func_info["title"] in content_lines[0]:
            pass
        else:
            output.append(f"**{func_info['title']}**\n")

    syntax_lines = []
    description_lines = []
    examples = []
    note_lines = []

    current_mode = "unknown"

    processed_items = []

    for line in content_lines:
        line = line.strip()
        if not line:
            continue

        # 移除行首尾的 |
        if line.startswith("|"):
            line = line[1:]
        if line.endswith("|"):
            line = line[:-1]

        # 拆解 pipe
        cells = [clean_cell_text(c) for c in line.split("|") if clean_cell_text(c)]

        for cell in cells:
            if not cell:
                continue

            # --- 過濾掉 Markdown 格式殘留 ---
            # 如果是 code block marker，跳過
            if cell.startswith("```"):
                continue

            if "說明:" in cell or "說明：" in cell:
                # 純粹的 "說明:" 行 -> mode switch
                if len(cell) < 10:
                    processed_items.append(("__DESC_START__", False))
                    continue

            if "範例" in cell and len(cell) < 10:
                processed_items.append(("__EXAMPLE_START__", False))
                continue

            if "備註" in cell or "注意事項" in cell:
                if ":" in cell or "：" in cell:
                    note_lines.append(cell)
                    continue
                else:
                    processed_items.append(("__NOTE_START__", False))
                    continue

            # 判斷類型
            is_code = is_syntax_line(cell, func_info["name"])
            processed_items.append((cell, is_code))

    # === 內容分類 ===

    current_example_code = []
    current_example_desc = []

    # 預設模式判斷
    if processed_items and processed_items[0][1] and current_mode == "unknown":
        current_mode = "syntax"
    elif processed_items:
        current_mode = "desc"

    for text, is_code in processed_items:
        if text == "__DESC_START__":
            current_mode = "desc"
            continue
        if text == "__EXAMPLE_START__":
            if current_example_code:
                examples.append((current_example_code, current_example_desc))
                current_example_code = []
                current_example_desc = []
            current_mode = "example"
            continue
        if text == "__NOTE_START__":
            if current_example_code:
                examples.append((current_example_code, current_example_desc))
                current_example_code = []
                current_example_desc = []
            current_mode = "note"
            continue

        if current_mode == "desc":
            if is_code:
                if not syntax_lines and len(text) < 100:
                    syntax_lines.append(text)
                else:
                    description_lines.append(text)
            else:
                description_lines.append(text)

        elif current_mode == "syntax":
            if is_code:
                syntax_lines.append(text)
            else:
                current_mode = "desc"
                description_lines.append(text)

        elif current_mode == "example":
            if is_code:
                current_example_code.append(text)
            else:
                current_example_desc.append(text)

        elif current_mode == "note":
            note_lines.append(text)

    if current_example_code:
        examples.append((current_example_code, current_example_desc))

    # === Re-validate syntax ===
    final_syntax = []
    for s in syntax_lines:
        chn_count = sum(1 for c in s if "\u4e00" <= c <= "\u9fff")
        if chn_count > 10:
            description_lines.insert(0, s)
        else:
            final_syntax.append(s)

    # === 輸出 ===
    if final_syntax:
        seen = set()
        unique_syntax = []
        for s in final_syntax:
            if s not in seen:
                unique_syntax.append(s)
                seen.add(s)
        output.append("```xs")
        output.append("\n".join(unique_syntax))
        output.append("```\n")

    if description_lines:
        output.append("**說明:**\n")
        # 清理 description 中可能的重複粗體標題
        cleaned_desc = []
        for d in description_lines:
            # 如果這行跟 title 一模一樣，或者是 "**Title**" 這種，跳過
            if (
                d.replace("*", "").strip() == func_info["name"]
                or d.replace("*", "").strip() == func_info["title"]
            ):
                continue
            cleaned_desc.append(d)
        output.append(f"{'\\n'.join(cleaned_desc)}\n")

    if examples:
        output.append("**範例:**\n")
        for code, desc in examples:
            if code:
                output.append("```xs")
                output.append("\n".join(code))
                output.append("```")
            if desc:
                output.append("\n".join(desc))
            output.append("")

    if note_lines:
        output.append("**注意事項:**\n")
        for n in note_lines:
            output.append(f"> {n}")
        output.append("")

    output.append("---\n")
    return "\n".join(output)


def extract_function_content(lines: list, start_idx: int) -> tuple:
    """提取函數內容直到下一個表頭 (支援 | 或 ###)"""
    content = []
    i = start_idx + 1

    while i < len(lines):
        line = lines[i]

        # 1. Table Row Start
        if line.strip().startswith("|") and "---" not in line:
            if parse_table_row(line):
                break

        # 2. Markdown Header Start
        if line.strip().startswith("### "):
            if parse_markdown_header(line):
                break

        # 3. Category Header Start
        if line.strip().startswith("## "):
            break

        content.append(line)
        i += 1

    return content, i


def convert_markdown(input_file: Path, output_file: Path):
    """轉換文件"""
    if not input_file.exists():
        print(f"❌ 找不到檔案: {input_file}")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    output = ["# XS 內建函數參考\n\n"]

    current_category = None
    i = 0
    processed_count = 0

    while i < len(lines):
        line = lines[i].strip()

        # 嘗試解析
        func_info = parse_table_row(line)
        if not func_info:
            func_info = parse_markdown_header(line)

        if func_info:
            # Update Category logic can be improved but for now rely on existing headers
            # If we hit a functional block, process it

            # 但先檢查是否剛好是 Category header (## )
            if line.startswith("## ") and not line.startswith("### "):
                current_category = line.replace("##", "").strip()
                output.append(f"\n## {current_category}\n\n")
                i += 1
                continue

            content, next_idx = extract_function_content(lines, i)
            formatted = format_function_block(func_info, content)
            output.append(formatted)

            i = next_idx
            processed_count += 1
        else:
            i += 1

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("".join(output))

    print(
        f"✅ 轉換完成: {input_file.name} -> {output_file.name} ({processed_count} items)"
    )


if __name__ == "__main__":
    pass
