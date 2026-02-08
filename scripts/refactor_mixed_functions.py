#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能解析器：自動拆分並重構混合內容的函數文檔
處理包含 \\n 跳脫字符的超長段落，將其轉換為結構化的 Markdown
"""

import re
from typing import List, Dict, Tuple


def parse_mixed_content(content: str) -> Dict[str, any]:
    """
    解析混合內容，提取語法、說明、範例等區塊

    Args:
        content: 包含 \\n 的混合內容字串

    Returns:
        結構化的字典，包含 syntax, description, examples, notes 等欄位
    """
    result = {
        "category": "",
        "syntax": [],
        "description": [],
        "parameters": [],
        "return_values": [],
        "examples": [],
        "notes": [],
    }

    # 先將 \\n 替換為真正的換行
    lines = content.replace("\\n", "\n").split("\n")

    current_block = "description"
    code_buffer = []
    text_buffer = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 識別類別（如「陣列函數」、「交易函數」）
        if re.match(r"^(陣列|交易|欄位|數學|字串|日期|一般)函數$", line):
            result["category"] = line
            continue

        # 識別程式碼行（包含特定關鍵字或模式）
        is_code = (
            re.search(
                r"(Array:|Var:|Value\d+|arr[A-Z]|For |Begin|End;|Print\(|SetPosition|if |then)",
                line,
                re.IGNORECASE,
            )
            or line.startswith("//")
            or "=" in line
            and not line.startswith("如果")
            and not line.startswith("回傳")
        )

        # 識別純數字行（通常是行號殘留）
        if re.match(r"^\d+$", line):
            continue

        if is_code:
            code_buffer.append(line)
        else:
            # 如果有累積的程式碼，先處理
            if code_buffer:
                if current_block == "description":
                    # 第一段程式碼通常是語法
                    if not result["syntax"]:
                        result["syntax"] = code_buffer.copy()
                    else:
                        result["examples"].extend(code_buffer)
                else:
                    result["examples"].extend(code_buffer)
                code_buffer = []

            # 處理文字說明
            text_buffer.append(line)

    # 處理剩餘的程式碼
    if code_buffer:
        result["examples"].extend(code_buffer)

    # 合併文字說明
    if text_buffer:
        result["description"] = text_buffer

    return result


def format_function_doc(func_name: str, parsed_data: Dict) -> str:
    """
    將解析後的資料格式化為標準 Markdown

    Args:
        func_name: 函數名稱
        parsed_data: 解析後的結構化資料

    Returns:
        格式化的 Markdown 字串
    """
    lines = [f"### {func_name}", ""]

    # 語法區塊
    if parsed_data.get("syntax"):
        # 檢查是否有已經包含函數名稱的語法
        syntax_lines = parsed_data["syntax"]
        if not any(func_name in line for line in syntax_lines):
            lines.append("**語法:**")
            lines.append("")

    # 說明區塊
    if parsed_data.get("description"):
        lines.append("**說明:**")
        lines.append("")

        # 分離出類別
        desc_lines = []
        for line in parsed_data["description"]:
            if line != parsed_data.get("category", ""):
                desc_lines.append(line)

        if desc_lines:
            lines.extend(desc_lines)
        lines.append("")

    # 範例區塊
    if parsed_data.get("examples"):
        lines.append("**範例:**")
        lines.append("")
        lines.append("```xs")

        # 清理範例程式碼
        for line in parsed_data["examples"]:
            # 移除行號
            cleaned = re.sub(r"^\d+\s+", "", line)
            lines.append(cleaned)

        lines.append("```")
        lines.append("")

    return "\r\n".join(lines)


def find_mixed_content_sections(filepath: str) -> List[Tuple[int, int, str]]:
    """
    掃描檔案，找出所有包含混合內容的區塊

    Args:
        filepath: 檔案路徑

    Returns:
        包含 (start_line, end_line, content) 的列表
    """
    sections = []

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i]

        # 檢查是否為函數標題
        if line.startswith("### "):
            func_name = line.replace("### ", "").strip()
            start_line = i + 1

            # 尋找下一個函數或分隔線
            j = i + 1
            while (
                j < len(lines)
                and not lines[j].startswith("### ")
                and not lines[j].startswith("---")
            ):
                j += 1

            # 檢查這個區塊是否包含 \\n
            block_content = "".join(lines[i:j])
            if "\\n" in block_content and (
                "函數" in block_content or "Array" in block_content
            ):
                sections.append((i, j, func_name))

            i = j
        else:
            i += 1

    return sections


def refactor_file(input_path: str, output_path: str = None):
    """
    重構整個檔案

    Args:
        input_path: 輸入檔案路徑
        output_path: 輸出檔案路徑（如為 None，則覆蓋原檔案）
    """
    if output_path is None:
        output_path = input_path

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 找出所有需要處理的區塊
    sections = find_mixed_content_sections(input_path)

    print(f"找到 {len(sections)} 個需要重構的函數")

    # 這裡我們需要更精細的處理
    # 暫時先輸出找到的區塊資訊
    for start, end, func_name in sections:
        print(f"  - {func_name} (行 {start}-{end})")

    return sections


if __name__ == "__main__":
    filepath = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\內建.md"
    sections = refactor_file(filepath)

    print(f"\n總計找到 {len(sections)} 個需要處理的函數區塊")
